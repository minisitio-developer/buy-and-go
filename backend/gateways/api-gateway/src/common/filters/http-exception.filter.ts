import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    meta: {
        timestamp: string;
        requestId: string;
    };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let details: any = undefined;
        let code = 'INTERNAL_ERROR';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const resp = exceptionResponse as any;
                message = resp.message || exception.message;
                details = resp.errors || resp.details;
            }

            switch (status) {
                case 400:
                    code = 'BAD_REQUEST';
                    break;
                case 401:
                    code = 'UNAUTHORIZED';
                    break;
                case 403:
                    code = 'FORBIDDEN';
                    break;
                case 404:
                    code = 'NOT_FOUND';
                    break;
                case 409:
                    code = 'CONFLICT';
                    break;
                case 429:
                    code = 'RATE_LIMIT_EXCEEDED';
                    break;
                default:
                    code = 'ERROR';
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const errorResponse: ErrorResponse = {
            success: false,
            error: {
                code,
                message,
                ...(details ? { details } : {}),
            },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: (request.headers['x-request-id'] as string) || 'unknown',
            },
        };

        response.status(status).json(errorResponse);
    }
}
