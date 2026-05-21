import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PickingModule } from './modules/picking/picking.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { RoutingModule } from './modules/routing/routing.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ColdChainModule } from './modules/cold-chain/cold-chain.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiProxyModule } from './modules/ai-proxy/ai-proxy.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AlertsModule } from './modules/alerts/alerts.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI', 'mongodb://localhost:27017/med-logistics'),
      }),
      inject: [ConfigService],
    }),

    // Redis / BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
      inject: [ConfigService],
    }),

    // Schedule (cron jobs)
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    OrdersModule,
    WarehousesModule,
    InventoryModule,
    PickingModule,
    VehiclesModule,
    DriversModule,
    DispatchModule,
    RoutingModule,
    TrackingModule,
    CustomersModule,
    ColdChainModule,
    ReportsModule,
    AiProxyModule,
    DashboardModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
