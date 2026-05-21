export enum DispatchStatus {
  PENDING = 'pending',          // 待分配
  ASSIGNED = 'assigned',        // 已分配（车辆+司机确认）
  LOADING = 'loading',          // 装货中
  DEPARTED = 'departed',        // 已发车
  IN_PROGRESS = 'in_progress',  // 配送中（部分送达）
  COMPLETED = 'completed',      // 已完成
  CANCELLED = 'cancelled',      // 已取消
  EXCEPTION = 'exception',      // 异常（车辆故障/事故等）
}

export enum DispatchPriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}
