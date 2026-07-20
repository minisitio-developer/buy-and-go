import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface FaceEnrollResult {
    success: boolean;
    template_id?: string;
    user_id?: string;
    algorithm?: string;
    quality_score?: number;
    error?: string;
}

export interface FaceVerifyResult {
    verified: boolean;
    score: number;
    quality_score: number;
    template_id?: string;
    algorithm?: string;
    message?: string;
}

export interface FaceIdentifyResult {
    identified: boolean;
    score: number;
    quality_score: number;
    user_id?: string;
    template_id?: string;
    message?: string;
}

export interface LivenessResult {
    live: boolean;
    confidence: number;
    reason?: string;
    details?: Record<string, any>;
}

@Injectable()
export class AiClient {
    constructor(
        @Inject(HttpService) private readonly http: HttpService,
        private readonly config: ConfigService,
    ) {}

    private get baseUrl(): string {
        return this.config.get('AI_SERVICE_URL', 'http://localhost:8000');
    }

    async enrollFace(userId: string, image: Buffer): Promise<FaceEnrollResult> {
        const form = new FormData();
        form.append('user_id', userId);
        form.append('image', new Blob([image]), 'face.jpg');

        const response = await firstValueFrom(
            this.http.post(`${this.baseUrl}/v1/face/enroll`, form, {
                headers: { ...form.getHeaders() },
            }),
        );
        return response.data;
    }

    async verifyFace(userId: string, image: Buffer, threshold = 0.4): Promise<FaceVerifyResult> {
        const form = new FormData();
        form.append('user_id', userId);
        form.append('image', new Blob([image]), 'face.jpg');
        form.append('threshold', String(threshold));

        const response = await firstValueFrom(
            this.http.post(`${this.baseUrl}/v1/face/verify`, form, {
                headers: { ...form.getHeaders() },
            }),
        );
        return response.data;
    }

    async identifyFace(image: Buffer, eventId: string, threshold = 0.4): Promise<FaceIdentifyResult> {
        const form = new FormData();
        form.append('image', new Blob([image]), 'face.jpg');
        form.append('event_id', eventId);
        form.append('threshold', String(threshold));

        const response = await firstValueFrom(
            this.http.post(`${this.baseUrl}/v1/face/identify`, form, {
                headers: { ...form.getHeaders() },
            }),
        );
        return response.data;
    }

    async livenessCheck(image: Buffer): Promise<LivenessResult> {
        const form = new FormData();
        form.append('image', new Blob([image]), 'face.jpg');

        const response = await firstValueFrom(
            this.http.post(`${this.baseUrl}/v1/face/liveness`, form, {
                headers: { ...form.getHeaders() },
            }),
        );
        return response.data;
    }
}
