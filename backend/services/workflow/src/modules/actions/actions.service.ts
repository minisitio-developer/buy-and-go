import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';
import axios from 'axios';
import * as Handlebars from 'handlebars';

@Injectable()
export class ActionsService {
    private readonly logger = new Logger(ActionsService.name);

    constructor(
        private readonly eventBus: EventBusService,
    ) {}

    async execute(type: string, config: Record<string, any>, context: Record<string, any>): Promise<any> {
        this.logger.log(`Executing action: ${type}`);

        switch (type) {
            case 'send_notification':
                return this.sendNotification(config, context);
            case 'send_email':
                return this.sendEmail(config, context);
            case 'create_deal':
                return this.createDeal(config, context);
            case 'update_crm':
                return this.updateCrm(config, context);
            case 'webhook_call':
                return this.webhookCall(config, context);
            case 'delay':
                return this.delay(config);
            case 'condition':
                return this.evaluateCondition(config, context);
            case 'log':
                return this.logAction(config, context);
            case 'transform':
                return this.transformData(config, context);
            default:
                throw new Error(`Unknown action type: ${type}`);
        }
    }

    private renderTemplate(template: string, context: Record<string, any>): string {
        const compiled = Handlebars.compile(template, { noEscape: true });
        return compiled(context);
    }

    private resolveValue(value: any, context: Record<string, any>): any {
        if (typeof value === 'string' && value.includes('{{')) {
            return this.renderTemplate(value, context);
        }
        if (Array.isArray(value)) {
            return value.map(v => this.resolveValue(v, context));
        }
        if (value && typeof value === 'object') {
            const result: Record<string, any> = {};
            for (const [key, val] of Object.entries(value)) {
                result[key] = this.resolveValue(val, context);
            }
            return result;
        }
        return value;
    }

    private async sendNotification(config: Record<string, any>, context: Record<string, any>) {
        const { channel, recipient, title, message, eventId } = config;
        const resolvedRecipient = this.resolveValue(recipient, context);
        const resolvedTitle = this.resolveValue(title, context);
        const resolvedMessage = this.resolveValue(message, context);

        await this.eventBus.publish(
            TOPICS.NOTIFICATION?.SEND ?? 'notification.send',
            'workflow.notification.send',
            {
                channel: channel || 'push',
                recipient: resolvedRecipient,
                title: resolvedTitle,
                message: resolvedMessage,
                eventId: eventId || context.eventId,
                metadata: { workflowId: context.workflowId, source: 'workflow' },
            },
        );

        this.logger.log(`Notification sent to ${resolvedRecipient}`);
        return { sent: true, channel, recipient: resolvedRecipient };
    }

    private async sendEmail(config: Record<string, any>, context: Record<string, any>) {
        const { to, subject, body, cc, bcc, eventId } = config;
        const resolvedTo = this.resolveValue(to, context);
        const resolvedSubject = this.resolveValue(subject, context);
        const resolvedBody = this.resolveValue(body, context);

        await this.eventBus.publish(
            'email.send',
            'workflow.email.send',
            {
                to: resolvedTo,
                cc: cc ? this.resolveValue(cc, context) : undefined,
                bcc: bcc ? this.resolveValue(bcc, context) : undefined,
                subject: resolvedSubject,
                body: resolvedBody,
                eventId: eventId || context.eventId,
                metadata: { workflowId: context.workflowId, source: 'workflow' },
            },
        );

        this.logger.log(`Email sent to ${resolvedTo}`);
        return { sent: true, to: resolvedTo, subject: resolvedSubject };
    }

    private async createDeal(config: Record<string, any>, context: Record<string, any>) {
        const { pipelineId, stageId, title, value, contactEmail, contactName, organizationId } = config;

        const resolvedTitle = this.resolveValue(title || 'New Deal', context);
        const resolvedValue = this.resolveValue(value, context);
        const resolvedContactEmail = this.resolveValue(contactEmail, context);
        const resolvedContactName = this.resolveValue(contactName, context);

        await this.eventBus.publish(
            'crm.deal.create',
            'workflow.crm.deal.create',
            {
                pipelineId: pipelineId || 'default',
                stageId: stageId || 'new',
                title: resolvedTitle,
                value: resolvedValue ? parseFloat(resolvedValue) : undefined,
                contactEmail: resolvedContactEmail,
                contactName: resolvedContactName,
                organizationId: organizationId || context.organizationId,
                metadata: { workflowId: context.workflowId, source: 'workflow' },
            },
        );

        this.logger.log(`Deal created: ${resolvedTitle}`);
        return { created: true, title: resolvedTitle, value: resolvedValue };
    }

    private async updateCrm(config: Record<string, any>, context: Record<string, any>) {
        const { entity, recordId, data, organizationId } = config;
        const resolvedRecordId = this.resolveValue(recordId, context);
        const resolvedData = this.resolveValue(data, context);

        await this.eventBus.publish(
            'crm.record.update',
            'workflow.crm.record.update',
            {
                entity: entity || 'contact',
                recordId: resolvedRecordId,
                data: resolvedData,
                organizationId: organizationId || context.organizationId,
                metadata: { workflowId: context.workflowId, source: 'workflow' },
            },
        );

        this.logger.log(`CRM ${entity} ${resolvedRecordId} updated`);
        return { updated: true, entity, recordId: resolvedRecordId };
    }

    private async webhookCall(config: Record<string, any>, context: Record<string, any>) {
        const { url, method, headers, body, timeout } = config;
        const resolvedUrl = this.resolveValue(url, context);
        const resolvedHeaders = headers ? this.resolveValue(headers, context) : {};
        const resolvedBody = body ? this.resolveValue(body, context) : undefined;

        this.logger.log(`Webhook call to ${resolvedUrl}`);

        try {
            const response = await axios({
                method: (method || 'POST').toLowerCase(),
                url: resolvedUrl,
                headers: { 'Content-Type': 'application/json', ...resolvedHeaders },
                data: resolvedBody,
                timeout: timeout || 30000,
                validateStatus: () => true,
            });

            this.logger.log(`Webhook call completed: ${response.status}`);
            return {
                statusCode: response.status,
                statusText: response.statusText,
                data: response.data,
                headers: response.headers,
            };
        } catch (error: any) {
            this.logger.error(`Webhook call failed: ${error.message}`);
            throw new Error(`Webhook call failed: ${error.message}`);
        }
    }

    private async delay(config: Record<string, any>) {
        const { seconds, milliseconds } = config;
        const ms = (seconds ? seconds * 1000 : undefined) ?? milliseconds ?? 0;

        if (ms > 0) {
            this.logger.log(`Delaying for ${ms}ms`);
            await new Promise(resolve => setTimeout(resolve, ms));
        }

        return { delayed: true, durationMs: ms };
    }

    private evaluateCondition(config: Record<string, any>, context: Record<string, any>): any {
        const { expression, variable, operator, value, conditions } = config;

        if (conditions && Array.isArray(conditions)) {
            for (const condition of conditions) {
                const matched = this.evaluateSingleCondition(condition, context);
                if (matched) {
                    return { matched: true, matchedCondition: condition.label || condition.name };
                }
            }
            return { matched: false };
        }

        if (expression) {
            const template = Handlebars.compile(expression, { noEscape: true });
            const result = template(context);
            const matched = result === 'true' || result === true;
            return { matched };
        }

        if (variable && operator && value !== undefined) {
            const resolvedVariable = this.resolveValue(variable, context);
            const resolvedValue = this.resolveValue(value, context);
            let matched = false;

            switch (operator) {
                case 'equals': case '==': case '===':
                    matched = resolvedVariable == resolvedValue;
                    break;
                case 'not_equals': case '!=': case '!==':
                    matched = resolvedVariable != resolvedValue;
                    break;
                case 'contains':
                    matched = String(resolvedVariable).includes(String(resolvedValue));
                    break;
                case 'starts_with':
                    matched = String(resolvedVariable).startsWith(String(resolvedValue));
                    break;
                case 'ends_with':
                    matched = String(resolvedVariable).endsWith(String(resolvedValue));
                    break;
                case 'greater_than': case '>':
                    matched = parseFloat(resolvedVariable) > parseFloat(resolvedValue);
                    break;
                case 'less_than': case '<':
                    matched = parseFloat(resolvedVariable) < parseFloat(resolvedValue);
                    break;
                case 'greater_than_or_equal': case '>=':
                    matched = parseFloat(resolvedVariable) >= parseFloat(resolvedValue);
                    break;
                case 'less_than_or_equal': case '<=':
                    matched = parseFloat(resolvedVariable) <= parseFloat(resolvedValue);
                    break;
                case 'is_empty':
                    matched = !resolvedVariable || resolvedVariable === '';
                    break;
                case 'is_not_empty':
                    matched = !!resolvedVariable && resolvedVariable !== '';
                    break;
                case 'in':
                    matched = Array.isArray(resolvedValue) && resolvedValue.includes(resolvedVariable);
                    break;
                case 'regex':
                    try {
                        matched = new RegExp(String(resolvedValue)).test(String(resolvedVariable));
                    } catch { matched = false; }
                    break;
                default:
                    matched = false;
            }

            return { matched, variable: resolvedVariable, operator, value: resolvedValue };
        }

        return { matched: true };
    }

    private evaluateSingleCondition(condition: Record<string, any>, context: Record<string, any>): boolean {
        const { variable, operator, value, expression } = condition;
        return this.evaluateCondition({ variable, operator, value, expression }, context).matched;
    }

    private logAction(config: Record<string, any>, context: Record<string, any>) {
        const { level, message, data } = config;
        const resolvedMessage = this.resolveValue(message || 'Log action', context);
        const resolvedData = data ? this.resolveValue(data, context) : undefined;

        const logLevel = (level || 'info').toLowerCase();
        const logEntry = { message: resolvedMessage, data: resolvedData, contextKeys: Object.keys(context) };

        switch (logLevel) {
            case 'debug': this.logger.debug(JSON.stringify(logEntry)); break;
            case 'warn': this.logger.warn(JSON.stringify(logEntry)); break;
            case 'error': this.logger.error(JSON.stringify(logEntry)); break;
            default: this.logger.log(JSON.stringify(logEntry)); break;
        }

        return { logged: true, level: logLevel, message: resolvedMessage };
    }

    private transformData(config: Record<string, any>, context: Record<string, any>): any {
        const { template, mapping } = config;

        if (template) {
            const compiled = Handlebars.compile(template, { noEscape: true });
            const result = compiled(context);
            try { return JSON.parse(result); } catch { return result; }
        }

        if (mapping && typeof mapping === 'object') {
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(mapping)) {
                result[key] = this.resolveValue(value, context);
            }
            return result;
        }

        return { transformed: true };
    }
}
