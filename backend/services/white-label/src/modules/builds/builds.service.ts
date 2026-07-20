import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infra/database/prisma.service';
import * as Handlebars from 'handlebars';
import AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as QRCode from 'qrcode';

@Injectable()
export class BuildsService {
    private readonly storagePath: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        this.storagePath = this.config.get<string>('STORAGE_PATH') || './storage/builds';
    }

    async create(data: {
        appInstanceId: string;
        version?: string;
    }) {
        const instance = await this.prisma.appInstance.findUnique({
            where: { id: data.appInstanceId },
            include: { template: true },
        });
        if (!instance) throw new NotFoundException('App instance not found');

        const version = data.version || `1.0.0-${Date.now()}`;

        const build = await this.prisma.appBuild.create({
            data: {
                appInstanceId: data.appInstanceId,
                version,
                status: 'building',
                buildLog: [],
            },
        });

        try {
            await this.generateApp(instance, build, version);
            const updatedBuild = await this.prisma.appBuild.update({
                where: { id: build.id },
                data: { status: 'ready' },
            });
            await this.prisma.appInstance.update({
                where: { id: instance.id },
                data: { status: 'ready' },
            });
            return updatedBuild;
        } catch (error: any) {
            await this.prisma.appBuild.update({
                where: { id: build.id },
                data: {
                    status: 'error',
                    buildLog: [{ error: error.message, timestamp: new Date().toISOString() }],
                },
            });
            await this.prisma.appInstance.update({
                where: { id: instance.id },
                data: { status: 'error' },
            });
            throw new BadRequestException(`Build failed: ${error.message}`);
        }
    }

    private async generateApp(instance: any, build: any, version: string) {
        const templateDir = path.join(
            __dirname, '..', '..', '..',
            'src', 'infra', 'templates', instance.template.baseTemplate,
        );
        const outputDir = path.join(this.storagePath, instance.id, build.id);
        await fs.mkdir(outputDir, { recursive: true });

        const buildLog: string[] = [];
        buildLog.push(`Loading template from ${templateDir}`);

        const config = {
            appName: instance.name,
            eventId: instance.eventId,
            organizationId: instance.organizationId,
            theme: typeof instance.theme === 'string' ? JSON.parse(instance.theme) : instance.theme,
            modules: typeof instance.modules === 'string' ? JSON.parse(instance.modules) : instance.modules,
            appConfig: typeof instance.config === 'string' ? JSON.parse(instance.config) : instance.config,
            version,
            buildId: build.id,
        };

        await this.processDirectory(templateDir, outputDir, templateDir, config, buildLog);

        const zipPath = path.join(this.storagePath, `${instance.id}-${build.id}.zip`);
        const zip = new AdmZip();
        zip.addLocalFolder(outputDir);
        zip.writeZip(zipPath);

        const qrCodeUrl = await this.generateQrCode(zipPath, instance.id, build.id);

        await this.prisma.appBuild.update({
            where: { id: build.id },
            data: {
                artifactUrl: zipPath,
                buildLog: buildLog.map(msg => ({ message: msg, timestamp: new Date().toISOString() })),
            },
        });

        await this.prisma.appInstance.update({
            where: { id: instance.id },
            data: { buildUrl: zipPath, qrCodeUrl },
        });
    }

    private async processDirectory(
        sourceDir: string,
        targetDir: string,
        baseDir: string,
        config: any,
        buildLog: string[],
    ) {
        const entries = await fs.readdir(sourceDir, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(sourceDir, entry.name);
            const relPath = path.relative(baseDir, srcPath);
            const targetPath = path.join(targetDir, entry.name.replace(/\.hbs$/, ''));

            if (entry.isDirectory()) {
                await fs.mkdir(targetPath, { recursive: true });
                await this.processDirectory(srcPath, targetPath, baseDir, config, buildLog);
            } else if (entry.name.endsWith('.hbs')) {
                const templateContent = await fs.readFile(srcPath, 'utf-8');
                const template = Handlebars.compile(templateContent);
                const rendered = template(config);
                await fs.writeFile(targetPath, rendered, 'utf-8');
                buildLog.push(`Rendered ${relPath} -> ${targetPath}`);
            } else {
                await fs.copyFile(srcPath, targetPath);
                buildLog.push(`Copied ${relPath}`);
            }
        }
    }

    private async generateQrCode(zipPath: string, instanceId: string, buildId: string) {
        const qrDir = path.join(this.storagePath, 'qrcodes');
        await fs.mkdir(qrDir, { recursive: true });

        const serverUrl = this.config.get<string>('SERVER_URL') || 'http://localhost:3017';
        const downloadUrl = `${serverUrl}/v1/builds/${buildId}/download`;
        const qrFilename = `${instanceId}-${buildId}.png`;
        const qrPath = path.join(qrDir, qrFilename);

        await QRCode.toFile(qrPath, downloadUrl, { width: 300 });

        const qrCodeUrl = `${serverUrl}/storage/qrcodes/${qrFilename}`;
        return qrCodeUrl;
    }

    async findByInstance(appInstanceId: string) {
        return this.prisma.appBuild.findMany({
            where: { appInstanceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const build = await this.prisma.appBuild.findUnique({
            where: { id },
            include: { appInstance: true },
        });
        if (!build) throw new NotFoundException('Build not found');
        return build;
    }

    async getDownloadPath(id: string) {
        const build = await this.findById(id);
        if (!build.artifactUrl) throw new NotFoundException('Artifact not available');
        return build.artifactUrl;
    }
}
