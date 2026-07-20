import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PushService {
    private readonly logger = new Logger(PushService.name);
    private fcmApp: any;

    constructor() {
        const projectId = process.env.FCM_PROJECT_ID;
        const privateKey = process.env.FCM_PRIVATE_KEY;
        const clientEmail = process.env.FCM_CLIENT_EMAIL;

        if (projectId && privateKey && clientEmail) {
            try {
                const admin = require('firebase-admin');
                if (!admin.apps.length) {
                    this.fcmApp = admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId,
                            privateKey: privateKey.replace(/\\n/g, '\n'),
                            clientEmail,
                        }),
                    });
                } else {
                    this.fcmApp = admin.app();
                }
                this.logger.log('Push service initialized with Firebase Cloud Messaging');
            } catch {
                this.logger.warn('Firebase Admin initialization failed, using console logger');
            }
        } else {
            this.logger.warn('FCM credentials not found, push notifications will be logged only');
        }
    }

    async send(data: { token: string; title: string; body: string; data?: Record<string, string> }): Promise<string> {
        if (this.fcmApp) {
            try {
                const messaging = this.fcmApp.messaging();
                const message: any = {
                    notification: { title: data.title, body: data.body },
                    token: data.token,
                };
                if (data.data) {
                    message.data = data.data;
                }
                const response = await messaging.send(message);
                this.logger.log(`Push sent to ${data.token}: ${response}`);
                return response;
            } catch (error: any) {
                this.logger.error(`FCM send failed: ${error.message}`);
                throw error;
            }
        }

        this.logger.log(`[Push Mock] Token: ${data.token} Title: ${data.title} Body: ${data.body}`);
        return `mock-${Date.now()}`;
    }
}
