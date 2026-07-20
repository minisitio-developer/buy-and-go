import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'], credentials: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const port = process.env.PORT || 3014;
    await app.listen(port);
    console.log(`Analytics service running on port ${port}`);
}
bootstrap();
