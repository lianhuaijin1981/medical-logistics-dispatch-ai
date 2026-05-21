export enum ReportType {
  DISPATCH_SUMMARY = 'dispatch_summary',           // 调度汇总
  INVENTORY_TURNOVER = 'inventory_turnover',       // 库存周转
  VEHICLE_UTILIZATION = 'vehicle_utilization',     // 车辆利用率
  DRIVER_PERFORMANCE = 'driver_performance',       // 司机绩效
  COLD_CHAIN_COMPLIANCE = 'cold_chain_compliance', // 冷链合规
  COST_ANALYSIS = 'cost_analysis',                 // 成本分析
  ORDER_ANALYSIS = 'order_analysis',               // 订单分析
  WAREHOUSE_EFFICIENCY = 'warehouse_efficiency',   // 仓储效率
}

export enum ReportStatus {
  DRAFT = 'draft',         // 草稿
  GENERATING = 'generating', // 生成中
  COMPLETED = 'completed',  // 已完成
  FAILED = 'failed',        // 生成失败
}

export enum ReportPeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}
