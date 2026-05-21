export enum PickingMethod {
  WAVE = 'wave',    // 波次拣货（按波次合并订单）
  BATCH = 'batch',  // 批量拣货（按商品合并）
  ZONE = 'zone',    // 分区拣货（按库区）
  PIECE = 'piece',  // 按单拣货（逐单）
}

export enum PickingStatus {
  PENDING = 'pending',          // 待拣货
  IN_PROGRESS = 'in_progress',  // 拣货中
  COMPLETED = 'completed',      // 已完成
  EXCEPTION = 'exception',      // 异常（缺货/错货）
  CANCELLED = 'cancelled',      // 已取消
}
