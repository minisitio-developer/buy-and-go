import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StorageDriver {
    save(key: string, data: Buffer, mimeType: string): Promise<string>;
    get(key: string): Promise<Buffer | null>;
    delete(key: string): Promise<void>;
    url(key: string): string;
}

class LocalDriver implements StorageDriver {
    private basePath: string;
    private baseUrl: string;

    constructor(basePath: string) {
        this.basePath = basePath;
        this.baseUrl = '/storage';
    }

    async save(key: string, data: Buffer, _mimeType: string): Promise<string> {
        const fullPath = path.join(this.basePath, key);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, data);
        return key;
    }

    async get(key: string): Promise<Buffer | null> {
        try {
            return await fs.readFile(path.join(this.basePath, key));
        } catch {
            return null;
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await fs.unlink(path.join(this.basePath, key));
        } catch {}
    }

    url(key: string): string {
        return `${this.baseUrl}/${key}`;
    }
}

class S3Driver implements StorageDriver {
    private bucket: string;
    private region: string;
    private endpoint: string;

    constructor(config: { endpoint: string; region: string; bucket: string }) {
        this.endpoint = config.endpoint;
        this.region = config.region;
        this.bucket = config.bucket;
    }

    async save(key: string, _data: Buffer, _mimeType: string): Promise<string> {
        throw new Error('S3 driver not implemented - use @aws-sdk/client-s3');
    }

    async get(_key: string): Promise<Buffer | null> {
        throw new Error('S3 driver not implemented');
    }

    async delete(_key: string): Promise<void> {
        throw new Error('S3 driver not implemented');
    }

    url(key: string): string {
        if (this.endpoint) return `${this.endpoint}/${this.bucket}/${key}`;
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
}

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private driver: StorageDriver;

    constructor(config: ConfigService) {
        const driverType = config.get<string>('STORAGE_DRIVER', 'local');

        if (driverType === 's3') {
            this.driver = new S3Driver({
                endpoint: config.get<string>('S3_ENDPOINT', ''),
                region: config.get<string>('S3_REGION', 'us-east-1'),
                bucket: config.get<string>('S3_BUCKET', 'eventos-documents'),
            });
        } else {
            const storagePath = config.get<string>('STORAGE_PATH', './storage');
            this.driver = new LocalDriver(storagePath);
        }

        this.logger.log(`Storage driver initialized: ${driverType}`);
    }

    async save(key: string, data: Buffer, mimeType: string = 'application/octet-stream'): Promise<string> {
        return this.driver.save(key, data, mimeType);
    }

    async get(key: string): Promise<Buffer | null> {
        return this.driver.get(key);
    }

    async delete(key: string): Promise<void> {
        return this.driver.delete(key);
    }

    url(key: string): string {
        return this.driver.url(key);
    }
}
