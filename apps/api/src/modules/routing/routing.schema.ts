import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum RouteAlgorithm {
  DIJKSTRA = 'dijkstra',
  ASTAR = 'astar',
  GA_VRP = 'ga_vrp',
  TABU_SEARCH = 'tabu_search',
  NEAREST_NEIGHBOR = 'nearest_neighbor',
  TWO_OPT = 'two_opt',
}

@Schema({ timestamps: true })
export class RoutePlan extends Document {
  @Prop({ type: String, ref: 'DispatchTask', required: true, unique: true, index: true })
  dispatchId: string;

  @Prop({ type: String, ref: 'Vehicle', required: true })
  vehicleId: string;

  @Prop({ type: [Object], required: true })
  stops: {
    sequence: number;
    orderId: string;
    type: 'pickup' | 'delivery';
    address: {
      province: string;
      city: string;
      district: string;
      detail: string;
      contactName: string;
      contactPhone: string;
      location?: { type: string; coordinates: number[] };
    };
    estimatedArrival: Date;
    estimatedDeparture: Date;
    serviceTime: number;       // seconds
    distanceFromPrev: number;   // meters
  }[];

  @Prop({ required: true, min: 0 })
  totalDistance: number; // meters

  @Prop({ required: true, min: 0 })
  totalDuration: number; // seconds

  @Prop({ type: Object })
  geometry?: {
    type: string;
    coordinates: number[][];
  };

  @Prop({ required: true, enum: Object.values(RouteAlgorithm) })
  algorithm: RouteAlgorithm;

  @Prop({ default: false })
  trafficConsidered: boolean;

  @Prop({ type: Date })
  calculatedAt?: Date;

  @Prop({ type: Number })
  computationTime?: number; // ms — 算法计算耗时

  // 高德地图返回的原始距离/时间（考虑实时路况后 vs 不考虑的对比）
  @Prop({ type: Object })
  trafficComparison?: {
    noTraffic: { distance: number; duration: number };
    withTraffic: { distance: number; duration: number };
    trafficRatio: number; // 拥堵系数 = withTraffic/noTraffic
  };
}

export const RoutePlanSchema = SchemaFactory.createForClass(RoutePlan);
export type RoutePlanDocument = RoutePlan & Document;

// 索引
RoutePlanSchema.index({ vehicleId: 1, calculatedAt: -1 });
RoutePlanSchema.index({ algorithm: 1 });
RoutePlanSchema.index({ totalDistance: 1 });
RoutePlanSchema.index({ 'stops.address.location': '2dsphere' });
RoutePlanSchema.index({ geometry: '2dsphere' });
