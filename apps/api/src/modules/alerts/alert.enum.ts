export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum AlertType {
  TEMPERATURE = 'temperature',     // 温度异常
  LOW_STOCK = 'low_stock',         // 库存不足
  EXPIRING = 'expiring',          // 即将过期
  VEHICLE_OFFLINE = 'vehicle_offline', // 车辆离线
  DELAY = 'delay',                 // 配送延误
  BREACH = 'breach',              // 冷链断链
}
