import { Module, Global, Logger, Provider, Injectable } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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

const logger = new Logger('DevMock');

// ---- Mock AuthService (override real one in dev mode) ----
@Injectable()
class MockAuthService {
  private readonly logger = new Logger('MockAuthService');
  private readonly jwtService = { sign: (payload: any) => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-dev-token' };

  async validateUser(username: string, _password: string): Promise<any> {
    this.logger.log(`[MOCK] validateUser: ${username}`);
    // Always return admin user for any credentials in dev mode
    return {
      _id: '507f1f77bcf86cd799439011',
      id: '507f1f77bcf86cd799439011',
      username,
      realName: username === 'admin' ? '管理员' : username,
      role: username === 'admin' ? 'admin' : 'operator',
      phone: '13800138000',
      email: `${username}@med-logistics.com`,
      isActive: true,
    };
  }

  async login(user: any) {
    this.logger.log(`[MOCK] login: ${user.username}`);
    const payload = {
      sub: user._id?.toString() || user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user._id?.toString() || user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  async getProfile(userId: string) {
    this.logger.log(`[MOCK] getProfile: ${userId}`);
    return {
      _id: userId,
      username: 'admin',
      realName: '管理员',
      role: 'admin',
      phone: '13800138000',
      email: 'admin@med-logistics.com',
    };
  }
}

// ---- Mock Model Factory ----
function createMockModel(name: string) {
  const doc = { _id: '000000000000000000000000', toJSON: () => doc, toObject: () => doc, save: () => Promise.resolve(doc) };
  const eq = { exec: () => Promise.resolve([]), lean: () => eq, sort: () => eq, skip: () => eq, limit: () => eq, populate: () => eq, select: () => eq };
  const es = { exec: () => Promise.resolve(null), lean: () => es, populate: () => es, select: () => es, sort: () => es };
  return {
    modelName: name,
    create: () => Promise.resolve(doc),
    find: () => eq, findOne: () => es, findById: () => es,
    findByIdAndUpdate: () => ({ exec: () => Promise.resolve(doc) }),
    findByIdAndDelete: () => ({ exec: () => Promise.resolve(doc) }),
    findOneAndUpdate: () => ({ exec: () => Promise.resolve(doc) }),
    findOneAndDelete: () => ({ exec: () => Promise.resolve(null) }),
    insertMany: () => Promise.resolve([doc]),
    deleteMany: () => Promise.resolve({ deletedCount: 0 }),
    deleteOne: () => Promise.resolve({ deletedCount: 0 }),
    updateMany: () => Promise.resolve({ modifiedCount: 0, matchedCount: 0 }),
    updateOne: () => Promise.resolve({ modifiedCount: 0, matchedCount: 0 }),
    countDocuments: () => ({ exec: () => Promise.resolve(0) }),
    aggregate: () => ({ exec: () => Promise.resolve([]) }),
    bulkWrite: () => Promise.resolve({}),
    watch: () => ({ on: () => {} }),
    db: { readyState: 1 },
    collection: { collectionName: name },
    schema: { paths: {}, obj: {} },
  };
}

const MODEL_NAMES = ['User', 'Order', 'Customer', 'Vehicle', 'Driver', 'Warehouse', 'InventoryItem', 'DispatchTask', 'PickingTask', 'RoutePlan', 'GPSTrack', 'ColdChainRecord', 'Report', 'Alert'];

// Mock connection with .models dict (forFeature 内部通过 connection.models[name] 读取)
const mockConn: any = {
  readyState: 1,
  models: {} as Record<string, any>,
  model: function (n: string) {
    if (!this.models[n]) this.models[n] = createMockModel(n);
    return this.models[n];
  },
  close: async () => {},
  on: () => mockConn,
  once: () => mockConn,
  emit: () => true,
  db: { collections: {} },
  collection: () => ({ find: () => ({ toArray: () => Promise.resolve([]) }) }),
  startSession: () => Promise.resolve({ startTransaction: () => {}, commitTransaction: () => Promise.resolve(), abortTransaction: () => Promise.resolve(), endSession: () => Promise.resolve() }),
};

// Pre-populate models dict
MODEL_NAMES.forEach((name) => {
  const m = createMockModel(name);
  mockConn.models[name] = m;
});

// ---- Mock Mongoose Global Module ----
const mockMongooseProviders: Provider[] = [
  { provide: getConnectionToken(), useValue: mockConn },
  { provide: 'DatabaseConnection', useValue: mockConn },
  ...MODEL_NAMES.map((name) => ({
    provide: getModelToken(name),
    useValue: createMockModel(name),
  })),
];

@Global()
@Module({
  providers: mockMongooseProviders,
  exports: mockMongooseProviders,
})
class MockMongooseModule {}

/**
 * Development AppModule — Mock 模式
 * - MockMongooseModule (@Global) 提供 DatabaseConnection + 全部 14 个 Model token
 * - feature modules 的 MongooseModule.forFeature() DI 依赖被 Mock 满足
 * - Swagger 基于装饰器静态分析，完整 API 文档
 * - HTTP 端口立即可用，CRUD 端点返回空数据
 */
@Module({
  imports: [
    MockMongooseModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    AuthModule, UsersModule, OrdersModule, WarehousesModule, InventoryModule,
    PickingModule, VehiclesModule, DriversModule, DispatchModule, RoutingModule,
    TrackingModule, CustomersModule, ColdChainModule, ReportsModule,
    AiProxyModule, DashboardModule, AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class DevAppModule {
  constructor() {
    logger.log('⚡ DevAppModule loaded — 14 Mock Models | Swagger at /api/docs');
  }
}
