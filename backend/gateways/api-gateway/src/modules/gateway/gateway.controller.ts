import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Gateway')
@Controller('api')
export class GatewayController {
    constructor(private readonly gatewayService: GatewayService) {}

    @Get(':service/*')
    @ApiOperation({ summary: 'Proxy GET request to the specified service' })
    async get(
        @Param('service') service: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const path = req.params[0] || '';
        const result = await this.gatewayService.proxy(
            service,
            path,
            'GET',
            undefined,
            req.headers,
            req.query as Record<string, string>,
        );
        res.status(result.status).set(result.headers).json(result.data);
    }

    @Post(':service/*')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Proxy POST request to the specified service' })
    async post(
        @Param('service') service: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const path = req.params[0] || '';
        const result = await this.gatewayService.proxy(
            service,
            path,
            'POST',
            req.body,
            req.headers,
        );
        res.status(result.status).set(result.headers).json(result.data);
    }

    @Put(':service/*')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Proxy PUT request to the specified service' })
    async put(
        @Param('service') service: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const path = req.params[0] || '';
        const result = await this.gatewayService.proxy(
            service,
            path,
            'PUT',
            req.body,
            req.headers,
        );
        res.status(result.status).set(result.headers).json(result.data);
    }

    @Patch(':service/*')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Proxy PATCH request to the specified service' })
    async patch(
        @Param('service') service: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const path = req.params[0] || '';
        const result = await this.gatewayService.proxy(
            service,
            path,
            'PATCH',
            req.body,
            req.headers,
        );
        res.status(result.status).set(result.headers).json(result.data);
    }

    @Delete(':service/*')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Proxy DELETE request to the specified service' })
    async delete(
        @Param('service') service: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const path = req.params[0] || '';
        const result = await this.gatewayService.proxy(
            service,
            path,
            'DELETE',
            undefined,
            req.headers,
        );
        res.status(result.status).set(result.headers).json(result.data);
    }
}
