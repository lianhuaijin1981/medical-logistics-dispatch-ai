import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);

  // Global middleware
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('医药物流智能调度系统 API')
    .setDescription('Medical Logistics Dispatch System — NestJS Backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', '认证授权')
    .addTag('orders', '订单管理')
    .addTag('warehouses', '仓库管理')
    .addTag('inventory', '库存管理')
    .addTag('vehicles', '车辆管理')
    .addTag('drivers', '司机管理')
    .addTag('dispatch', '调度管理')
    .addTag('routes', '路径规划')
    .addTag('tracking', '实时追踪')
    .addTag('customers', '客户管理')
    .addTag('cold-chain', '冷链监控')
    .addTag('reports', '报表分析')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`🚑 Medical Logistics API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
