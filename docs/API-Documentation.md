# 医药物流智能调度系统 API 文档

> 生成时间: 2026-05-21  
> 版本: 1.0.0 - Dev Mode  
> 基础路径: `/api`  

## 认证方式

所有 API（除 `POST /api/auth/login` 外）需在 Header 中携带 Bearer Token:
```
Authorization: Bearer <jwt_token>
```

---

## ai-proxy

### GET `/api/ai-proxy`

获取列表

**Responses:**
- `200`: 

---

### POST `/api/ai-proxy`

创建

**Responses:**
- `201`: 

---

### GET `/api/ai-proxy/{id}`

获取详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### PUT `/api/ai-proxy/{id}`

更新

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### DELETE `/api/ai-proxy/{id}`

删除

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## alerts

### 🔒 GET `/api/alerts`

获取告警列表

**Responses:**
- `200`: 

---

### 🔒 GET `/api/alerts/{id}`

获取告警详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PATCH `/api/alerts/{id}/resolve`

处理告警

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateAlertDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## auth

_认证授权_

### POST `/api/auth/login`

用户登录

**Responses:**
- `201`: 

---

### 🔒 GET `/api/auth/profile`

获取当前用户信息

**Responses:**
- `200`: 

---

## cold-chain

_冷链监控_

### 🔒 GET `/api/cold-chain`

获取冷链温控记录列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/cold-chain`

上报温控数据（单条）

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateColdChainRecordDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/cold-chain/breaches`

获取超温记录（断链告警）

**Responses:**
- `200`: 

---

### 🔒 GET `/api/cold-chain/dispatch/{dispatchId}`

按调度任务查询完整冷链记录

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| dispatchId | path | string | ✓ |  |
| limit | query | number | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/cold-chain/{id}`

获取冷链记录详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/cold-chain/{id}`

删除冷链记录

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 POST `/api/cold-chain/batch`

批量上报温控数据

**Request Body:**
```json
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

**Responses:**
- `201`: 

---

## customers

_客户管理_

### 🔒 GET `/api/customers`

获取客户列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/customers`

创建客户

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateCustomerDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/customers/search`

搜索客户

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| keyword | query | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/customers/{id}`

获取客户详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/customers/{id}`

更新客户

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateCustomerDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/customers/{id}`

删除客户

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## dashboard

### 🔒 GET `/api/dashboard/stats`

获取运营大盘统计数据

**Responses:**
- `200`: 

---

## dispatch

_调度管理_

### 🔒 GET `/api/dispatch`

获取调度任务列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/dispatch`

创建调度任务

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateDispatchDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/dispatch/vehicle/{vehicleId}`

按车辆查询调度记录

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| vehicleId | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/dispatch/driver/{driverId}`

按司机查询调度记录

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| driverId | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/dispatch/{id}`

获取调度任务详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/dispatch/{id}`

更新调度任务

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateDispatchDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/dispatch/{id}`

删除调度任务

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PATCH `/api/dispatch/{id}/status`

更新调度状态（发车/到达/完成）

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateDispatchStatusDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## drivers

_司机管理_

### 🔒 GET `/api/drivers`

获取司机列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/drivers`

新增司机

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateDriverDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/drivers/available`

获取可用司机（调度分配用）

**Responses:**
- `200`: 

---

### 🔒 GET `/api/drivers/{id}`

获取司机详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/drivers/{id}`

更新司机信息

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateDriverDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/drivers/{id}`

删除司机

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PATCH `/api/drivers/{id}/status`

更新司机状态

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## health

### GET `/api`

健康检查

**Responses:**
- `200`: 

---

## inventory

_库存管理_

### 🔒 GET `/api/inventory`

获取库存列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/inventory`

创建库存记录

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateInventoryDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/inventory/low-stock`

获取低库存预警列表

**Responses:**
- `200`: 

---

### 🔒 GET `/api/inventory/expiring`

获取临期库存列表

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| days | query | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/inventory/{id}`

获取库存详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/inventory/{id}`

更新库存记录

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateInventoryDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/inventory/{id}`

删除库存记录

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## orders

_订单管理_

### 🔒 GET `/api/orders`

获取订单列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/orders`

创建订单

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateOrderDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/orders/status/{status}`

按状态查询订单

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| status | path | string | ✓ |  |
| limit | query | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/orders/{id}`

获取订单详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/orders/{id}`

更新订单

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateOrderDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/orders/{id}`

删除订单

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## picking

### 🔒 GET `/api/picking`

获取拣货任务列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/picking`

创建拣货任务

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreatePickingDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/picking/wave/{waveNo}`

按波次号查询拣货任务

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| waveNo | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/picking/{id}`

获取拣货任务详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/picking/{id}`

更新拣货任务

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdatePickingDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/picking/{id}`

删除拣货任务

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PATCH `/api/picking/{id}/start`

开始拣货

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PATCH `/api/picking/{id}/complete`

完成拣货

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## reports

_报表分析_

### 🔒 GET `/api/reports`

获取报表列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/reports`

创建报表（草稿/调度任务）

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateReportDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/reports/{id}`

获取报表详情（含数据）

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/reports/{id}`

更新报表配置

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateReportDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/reports/{id}`

删除报表

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PATCH `/api/reports/{id}/generate`

完成报表生成（写入结果）

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PATCH `/api/reports/{id}/fail`

标记报表生成失败

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## routing

### 🔒 GET `/api/routing`

获取路径规划列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/routing`

创建路径规划（调用高德/算法）

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateRouteDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/routing/dispatch/{dispatchId}`

按调度任务查询路径规划

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| dispatchId | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/routing/{id}`

获取路径规划详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/routing/{id}`

更新路径规划

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateRouteDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/routing/{id}`

删除路径规划

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## tracking

_实时追踪_

### 🔒 GET `/api/tracking`

获取 GPS 轨迹列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/tracking`

上报 GPS 位置（单条）

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateGPSTrackDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/tracking/latest/{vehicleId}`

获取车辆最新位置

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| vehicleId | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/tracking/dispatch/{dispatchId}`

按调度任务查询完整轨迹

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| dispatchId | path | string | ✓ |  |
| limit | query | number | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/tracking/timerange/{vehicleId}`

按时间段查询车辆轨迹

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| vehicleId | path | string | ✓ |  |
| startTime | query | string | ✓ |  |
| endTime | query | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/tracking/{id}`

获取单条轨迹详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/tracking/{id}`

删除轨迹记录

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 POST `/api/tracking/batch`

批量上报 GPS 位置

**Request Body:**
```json
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

**Responses:**
- `201`: 

---

## users

### GET `/api/users`

获取列表

**Responses:**
- `200`: 

---

### POST `/api/users`

创建

**Responses:**
- `201`: 

---

### GET `/api/users/{id}`

获取详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### PUT `/api/users/{id}`

更新

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### DELETE `/api/users/{id}`

删除

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## vehicles

_车辆管理_

### 🔒 GET `/api/vehicles`

获取车辆列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/vehicles`

新增车辆

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateVehicleDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/vehicles/available`

获取可用车辆（调度选车用）

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| type | query | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/vehicles/{id}`

获取车辆详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/vehicles/{id}`

更新车辆信息

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateVehicleDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/vehicles/{id}`

删除车辆

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PATCH `/api/vehicles/{id}/status`

更新车辆状态

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

## warehouses

_仓库管理_

### 🔒 GET `/api/warehouses`

获取仓库列表

**Responses:**
- `200`: 

---

### 🔒 POST `/api/warehouses`

创建仓库

**Request Body:**
```json
{
  "$ref": "#/components/schemas/CreateWarehouseDto"
}
```

**Responses:**
- `201`: 

---

### 🔒 GET `/api/warehouses/type/{type}`

按类型获取仓�?

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| type | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 GET `/api/warehouses/{id}`

获取仓库详情

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 PUT `/api/warehouses/{id}`

更新仓库

**Request Body:**
```json
{
  "$ref": "#/components/schemas/UpdateWarehouseDto"
}
```

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

### 🔒 DELETE `/api/warehouses/{id}`

删除仓库

**Query/Path 参数:**

| 名称 | 位置 | 类型 | 必填 | 描述 |
|------|------|------|------|------|
| id | path | string | ✓ |  |

**Responses:**
- `200`: 

---

