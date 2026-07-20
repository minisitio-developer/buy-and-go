import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infra/database/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';
import * as Handlebars from 'handlebars';
import { v4 as uuid } from 'uuid';
import { DateTime } from 'luxon';
import sharp from 'sharp';

@Injectable()
export class GenerationService implements OnModuleInit {
    private readonly logger = new Logger(GenerationService.name);
    private puppeteer: any = null;
    private queue: string[] = [];
    private processing = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
        private readonly eventBus: EventBusService,
        private readonly config: ConfigService,
    ) {}

    async onModuleInit() {
        this.registerHandlebarsHelpers();
    }

    private registerHandlebarsHelpers() {
        Handlebars.registerHelper('formatDate', (date: string, format?: string) => {
            return DateTime.fromISO(date).toFormat(format || 'dd/MM/yyyy');
        });

        Handlebars.registerHelper('now', (format?: string) => {
            return DateTime.now().toFormat(format || 'dd/MM/yyyy');
        });

        Handlebars.registerHelper('uppercase', (text: string) => text?.toUpperCase());
        Handlebars.registerHelper('lowercase', (text: string) => text?.toLowerCase());

        Handlebars.registerHelper('qrCode', (data: string, size?: number) => {
            const qrSize = size || 150;
            const encoded = encodeURIComponent(data);
            return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encoded}" alt="QR Code" width="${qrSize}" height="${qrSize}" style="image-rendering:pixelated;" />`;
        });

        Handlebars.registerHelper('ifEquals', function(this: any, arg1: any, arg2: any, options: any) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('ifNotEmpty', function(this: any, value: any, options: any) {
            return (value && value.length > 0) ? options.fn(this) : options.inverse(this);
        });
    }

    private async getBrowser() {
        if (this.puppeteer) return this.puppeteer;

        try {
            const puppeteer = await import('puppeteer');
            const executablePath = this.config.get<string>('PUPPETEER_EXECUTABLE_PATH');

            this.puppeteer = await puppeteer.launch({
                executablePath: executablePath || undefined,
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--single-process',
                ],
            });

            this.logger.log('Puppeteer browser launched');
            return this.puppeteer;
        } catch (error) {
            this.logger.error('Failed to launch Puppeteer', error);
            throw error;
        }
    }

    async generate(documentId: string): Promise<void> {
        this.queue.push(documentId);
        if (!this.processing) {
            this.processing = true;
            await this.processQueue();
        }
    }

    private async processQueue(): Promise<void> {
        while (this.queue.length > 0) {
            const documentId = this.queue.shift()!;
            try {
                await this.generateDocument(documentId);
            } catch (error: any) {
                this.logger.error(`Failed to generate document ${documentId}`, error);
                await this.markFailed(documentId, error.message);
            }
        }
        this.processing = false;
    }

    private async generateDocument(documentId: string): Promise<void> {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: { template: true },
        });

        if (!document) {
            throw new Error(`Document ${documentId} not found`);
        }

        if (!document.template) {
            throw new Error(`No template associated with document ${documentId}`);
        }

        this.logger.log(`Generating document ${documentId} (${document.name})`);

        const compiled = Handlebars.compile(document.template.content);
        const metadata = document.metadata as Record<string, any>;
        const html = compiled(metadata);

        let storageKey: string;
        let fileSize: number;

        if (document.format === 'pdf') {
            const pdfResult = await this.htmlToPdf(html, {
                orientation: document.template.orientation,
                pageSize: document.template.pageSize,
            });
            storageKey = `documents/${document.organizationId}/${document.type}/${documentId}.pdf`;
            fileSize = pdfResult.length;
            await this.storage.save(storageKey, pdfResult, 'application/pdf');
        } else if (document.format === 'png') {
            const pngResult = await this.htmlToImage(html, 'png', {
                orientation: document.template.orientation,
                pageSize: document.template.pageSize,
            });
            storageKey = `documents/${document.organizationId}/${document.type}/${documentId}.png`;
            fileSize = pngResult.length;
            await this.storage.save(storageKey, pngResult, 'image/png');
        } else {
            storageKey = `documents/${document.organizationId}/${document.type}/${documentId}.html`;
            const buf = Buffer.from(html, 'utf-8');
            fileSize = buf.length;
            await this.storage.save(storageKey, buf, 'text/html');
        }

        const storageUrl = this.storage.url(storageKey);

        await this.prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'generated',
                storageUrl,
                fileSize,
                generatedAt: new Date(),
            },
        });

        this.eventBus.publish(
            'document.generated',
            'document.generated',
            {
                documentId,
                organizationId: document.organizationId,
                eventId: document.eventId,
                type: document.type,
                name: document.name,
                format: document.format,
                storageUrl,
                fileSize,
                generatedAt: new Date().toISOString(),
            },
        ).catch(err => this.logger.error('Failed to publish document.generated event', err));

        this.logger.log(`Document ${documentId} generated successfully (${(fileSize / 1024).toFixed(1)} KB)`);
    }

    async htmlToPdf(html: string, options?: { orientation?: string; pageSize?: string }): Promise<Buffer> {
        const browser = await this.getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });
            await page.addStyleTag({ content: this.getBaseStyles() });

            const pdf = await page.pdf({
                format: (options?.pageSize || 'A4') as any,
                landscape: options?.orientation === 'landscape',
                printBackground: true,
                margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
            });

            return Buffer.from(pdf);
        } finally {
            await page.close();
        }
    }

    async htmlToImage(html: string, format: 'png' | 'jpeg' = 'png', options?: { orientation?: string; pageSize?: string }): Promise<Buffer> {
        const browser = await this.getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });
            await page.addStyleTag({ content: this.getBaseStyles() });

            const dimensions = options?.pageSize === 'A4'
                ? { width: options?.orientation === 'landscape' ? 297 : 210, height: options?.orientation === 'landscape' ? 210 : 297 }
                : { width: 210, height: 297 };

            await page.setViewport({
                width: Math.round(dimensions.width * 3.78),
                height: Math.round(dimensions.height * 3.78),
                deviceScaleFactor: 2,
            });

            const screenshot = await page.screenshot({
                type: format,
                fullPage: true,
            });

            return Buffer.from(screenshot);
        } finally {
            await page.close();
        }
    }

    async processImage(buffer: Buffer, operations: {
        resize?: { width?: number; height?: number; fit?: string };
        format?: 'png' | 'jpeg' | 'webp';
        quality?: number;
        grayscale?: boolean;
    }): Promise<Buffer> {
        let pipeline = sharp(buffer);

        if (operations.resize) {
            pipeline = pipeline.resize(operations.resize.width, operations.resize.height, {
                fit: (operations.resize.fit as any) || 'inside',
                withoutEnlargement: true,
            });
        }

        if (operations.grayscale) {
            pipeline = pipeline.grayscale();
        }

        const format = operations.format || 'png';
        const quality = operations.quality || 90;

        switch (format) {
            case 'jpeg': pipeline = pipeline.jpeg({ quality }); break;
            case 'webp': pipeline = pipeline.webp({ quality }); break;
            default: pipeline = pipeline.png({ quality });
        }

        return pipeline.toBuffer();
    }

    private getBaseStyles(): string {
        return `
            body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #333; }
            @page { margin: 15mm; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
            .page-break { page-break-after: always; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .mt-4 { margin-top: 16px; }
            .mb-4 { margin-bottom: 16px; }
        `;
    }

    private async markFailed(documentId: string, error: string) {
        try {
            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    status: 'failed',
                    metadata: { error },
                },
            });
        } catch (err) {
            this.logger.error(`Failed to mark document ${documentId} as failed`, err);
        }
    }
}
