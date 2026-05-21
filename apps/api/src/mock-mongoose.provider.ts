import { Provider } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { EventEmitter } from 'events';

/**
 * Mock Mongoose Connection provider for development mode (Swagger/docs only).
 * Provides a fake connection object to satisfy all MongooseModule.forFeature() registrations
 * without requiring a real MongoDB instance.
 */
class MockConnection extends EventEmitter {
  readyState = 1;
  name = 'mock';
  host = 'localhost';
  port = 27017;

  model<T>(name: string): any {
    return new Proxy(
      {},
      {
        get: (_, prop: string) => {
          if (prop === 'modelName') return name;
          if (prop === 'find') return () => ({ exec: () => Promise.resolve([]) });
          if (prop === 'findOne') return () => ({ exec: () => Promise.resolve(null) });
          if (prop === 'findById') return () => ({ exec: () => Promise.resolve(null) });
          if (prop === 'create') return () => Promise.resolve({});
          if (prop === 'findByIdAndUpdate') return () => ({ exec: () => Promise.resolve(null) });
          if (prop === 'findByIdAndDelete') return () => ({ exec: () => Promise.resolve(null) });
          if (prop === 'countDocuments') return () => ({ exec: () => Promise.resolve(0) });
          if (prop === 'aggregate') return () => ({ exec: () => Promise.resolve([]) });
          if (prop === 'insertMany') return () => Promise.resolve([]);
          if (prop === 'deleteMany') return () => Promise.resolve({ deletedCount: 0 });
          if (prop === 'updateMany') return () => Promise.resolve({ modifiedCount: 0 });
          if (prop === 'findOneAndUpdate') return () => ({ exec: () => Promise.resolve(null) });
          return () => ({ exec: () => Promise.resolve(null) });
        },
      },
    );
  }

  models: Record<string, any> = {};
  collections: Record<string, any> = {};
  db: any = {};

  async close() {}
  async asPromise() {
    return this;
  }
}

const mockConnection = new MockConnection();

export const mockMongooseProviders: Provider[] = [
  {
    provide: getConnectionToken(),
    useValue: mockConnection,
  },
  {
    provide: 'DatabaseConnection',
    useValue: mockConnection,
  },
];

/**
 * Creates a mock model provider for a given Mongoose schema name.
 * Usage in modules that use MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }])
 * These must be replaced with mock providers in the dev module.
 */
export function createMockModelProvider(name: string): Provider {
  return {
    provide: getModelToken(name),
    useValue: mockConnection.model(name),
  };
}

/**
 * Creates mock model providers for multiple schema names.
 */
export function createMockModelProviders(...names: string[]): Provider[] {
  return names.map((name) => createMockModelProvider(name));
}
