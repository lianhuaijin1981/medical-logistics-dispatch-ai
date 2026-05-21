import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order, OrderSchema } from '../orders/order.schema';
import { InventoryItem, InventoryItemSchema } from '../inventory/inventory.schema';
import { Vehicle, VehicleSchema } from '../vehicles/vehicle.schema';
import { Driver, DriverSchema } from '../drivers/driver.schema';
import { Alert, AlertSchema } from '../alerts/alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: 'Alert', schema: AlertSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
