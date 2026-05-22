import { NestFactory } from '@nestjs/core';
import { ExecutionContext, CallHandler, Injectable, NestInterceptor, ValidationPipe } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import { DevAppModule } from './app.dev.module';

// ---- TransformInterceptor: wrap all responses as ApiResponse<T> ----
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is already wrapped (has data + message), pass through
        if (data && typeof data === 'object' && 'data' in data && 'message' in data) {
          return data;
        }
        return {
          data,
          message: '操作成功',
        };
      }),
    );
  }
}

async function bootstrap() {
  // Force development mode (enables mock auth bypass)
  process.env.NODE_ENV = 'development';

  const app = await NestFactory.create(DevAppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);

  // Global middleware
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

  // Global interceptor: wrap responses as { data, message }
  app.useGlobalInterceptors(new TransformInterceptor());

  app.setGlobalPrefix('api');

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('医药物流智能调度系统 API')
    .setDescription(`
## Medical Logistics Dispatch System — NestJS Backend

### 开发模式 (Mock)
当前运行在 **Dev/Mock 模式**，MongoDB 和 Redis 不可用。
- Swagger 文档完全可用，所有 API 契约基于 DTO 装饰器自动生成
- CRUD 端点返回 503 Mock 占位响应
- 用于前后端联调时的 API 契约验证
    `.trim())
    .setVersion('1.0.0 - Dev Mode')
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
  console.log(`\n========================================`);
  console.log(`  🚑 Medical Logistics API (Dev Mock Mode)`);
  console.log(`  📡 http://localhost:${port}`);
  console.log(`  📚 Swagger: http://localhost:${port}/api/docs`);
  console.log(`  ⚠️  MongoDB/Redis 不可用 — API 返回 Mock 数据`);
  console.log(`========================================\n`);
}

bootstrap();
