import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 开始初始化数据库种子数据...');

  // Connect to MongoDB directly
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/med-logistics';
  await mongoose.connect(mongoUri);
  console.log(`✅ 已连接 MongoDB: ${mongoUri}`);

  const db = mongoose.connection.db;
  if (!db) throw new Error('无法获取 MongoDB 数据库实例');

  // ============ 1. Users ============
  const users = [
    {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      realName: '系统管理员',
      role: 'admin',
      phone: '13800138000',
      enabled: true,
      permissions: ['*'],
    },
    {
      username: 'manager',
      password: await bcrypt.hash('manager123', 10),
      realName: '张经理',
      role: 'manager',
      phone: '13800138001',
      enabled: true,
      permissions: ['orders:read', 'orders:write', 'dashboard:read'],
    },
    {
      username: 'operator',
      password: await bcrypt.hash('operator123', 10),
      realName: '李操作员',
      role: 'operator',
      phone: '13800138002',
      enabled: true,
      permissions: ['orders:read', 'dispatch:read'],
    },
  ];
  const userCol = db.collection('users');
  await userCol.deleteMany({});
  await userCol.insertMany(users);
  console.log(`✅ Users: ${users.length} 条`);

  // ============ 2. Warehouses ============
  const warehouses = [
    {
      code: 'WH-001',
      name: '华东中心仓',
      type: 'central',
      address: {
        province: '上海',
        city: '上海',
        district: '浦东新区',
        detail: '张江医药物流园区A1栋',
        location: { type: 'Point', coordinates: [121.5444, 31.2353] },
      },
      capacity: 50000,
      temperatureZones: ['ambient', 'cool', 'cold', 'frozen'],
      enabled: true,
    },
    {
      code: 'WH-002',
      name: '华南区域仓',
      type: 'regional',
      address: {
        province: '广东',
        city: '广州',
        district: '黄埔区',
        detail: '广州医药港B2栋',
        location: { type: 'Point', coordinates: [113.4683, 23.1005] },
      },
      capacity: 20000,
      temperatureZones: ['ambient', 'cool', 'cold'],
      enabled: true,
    },
    {
      code: 'WH-003',
      name: '华北冷链仓',
      type: 'cold_chain',
      address: {
        province: '北京',
        city: '北京',
        district: '顺义区',
        detail: '天竺综合保税区C3',
        location: { type: 'Point', coordinates: [116.6535, 40.1285] },
      },
      capacity: 10000,
      temperatureZones: ['cool', 'cold', 'frozen'],
      enabled: true,
    },
  ];
  const whCol = db.collection('warehouses');
  await whCol.deleteMany({});
  await whCol.insertMany(warehouses);
  console.log(`✅ Warehouses: ${warehouses.length} 条`);

  // ============ 3. Vehicles ============
  const vehicles = [
    { plateNumber: '沪A·12345', brand: '福田', vehicleModel: '奥铃CTS', type: 'van', status: 'available', temperatureZones: ['ambient'], capacity: 12, maxWeight: 3000, enabled: true },
    { plateNumber: '沪A·12346', brand: '东风', vehicleModel: '天龙KL', type: 'truck', status: 'on_trip', temperatureZones: ['ambient', 'cool'], capacity: 30, maxWeight: 12000, enabled: true },
    { plateNumber: '沪A·12347', brand: '解放', vehicleModel: 'J6P', type: 'refrigerated', status: 'available', temperatureZones: ['cool', 'cold', 'frozen'], capacity: 25, maxWeight: 8000, enabled: true },
    { plateNumber: '沪A·12348', brand: '比亚迪', vehicleModel: 'T5D', type: 'ev', status: 'maintenance', temperatureZones: ['ambient', 'cool'], capacity: 15, maxWeight: 4500, enabled: true },
    { plateNumber: '沪A·12349', brand: '福田', vehicleModel: '欧马可S5', type: 'van', status: 'available', temperatureZones: ['ambient'], capacity: 8, maxWeight: 2000, enabled: true },
    { plateNumber: '沪A·12350', brand: '江淮', vehicleModel: '帅铃Q9', type: 'refrigerated', status: 'on_trip', temperatureZones: ['cold', 'frozen'], capacity: 20, maxWeight: 6000, enabled: true },
    { plateNumber: '沪A·12351', brand: '东风', vehicleModel: '凯普特', type: 'van', status: 'available', capacity: 10, temperatureZones: ['ambient'], maxWeight: 2500, enabled: true },
    { plateNumber: '沪A·12352', brand: '福田', vehicleModel: '图雅诺', type: 'ev', status: 'offline', capacity: 6, temperatureZones: ['cool'], maxWeight: 1500, enabled: false },
  ];
  const vhCol = db.collection('vehicles');
  await vhCol.deleteMany({});
  await vhCol.insertMany(vehicles);
  console.log(`✅ Vehicles: ${vehicles.length} 条`);

  // ============ 4. Drivers ============
  const drivers = [
    { name: '王师傅', phone: '13900139001', licenseNumber: 'DL-001', status: 'available', enabled: true },
    { name: '赵师傅', phone: '13900139002', licenseNumber: 'DL-002', status: 'on_trip', enabled: true },
    { name: '刘师傅', phone: '13900139003', licenseNumber: 'DL-003', status: 'available', enabled: true },
    { name: '陈师傅', phone: '13900139004', licenseNumber: 'DL-004', status: 'off_duty', enabled: true },
    { name: '周师傅', phone: '13900139005', licenseNumber: 'DL-005', status: 'available', enabled: true },
    { name: '吴师傅', phone: '13900139006', licenseNumber: 'DL-006', status: 'on_trip', enabled: true },
  ];
  const drCol = db.collection('drivers');
  await drCol.deleteMany({});
  await drCol.insertMany(drivers);
  console.log(`✅ Drivers: ${drivers.length} 条`);

  // ============ 5. Orders ============
  const orders = [
    {
      orderNo: 'MD202605210001',
      warehouseId: warehouses[0].code,
      items: [
        { sku: 'SKU-001', name: '阿莫西林胶囊', quantity: 1000, unit: '盒', unitPrice: 12.5 },
        { sku: 'SKU-002', name: '布洛芬缓释胶囊', quantity: 500, unit: '盒', unitPrice: 15.8 },
      ],
      priority: 'normal',
      status: 'delivered',
      requestedDeliveryWindow: { start: new Date('2026-05-20T08:00:00'), end: new Date('2026-05-21T12:00:00') },
      totalWeight: 150,
      totalVolume: 0.8,
      totalAmount: 20400,
      temperatureRequirements: ['ambient'],
      shippingAddress: {
        province: '上海', city: '上海', district: '徐汇区', detail: '某社区医院',
        contactName: '张医生', contactPhone: '13700137001',
        location: { type: 'Point', coordinates: [121.4431, 31.1941] },
      },
      statusHistory: [{ status: 'pending', timestamp: new Date('2026-05-20T08:00:00'), operator: '系统', remark: '订单创建' }],
    },
    {
      orderNo: 'MD202605210002',
      warehouseId: warehouses[0].code,
      items: [
        { sku: 'SKU-003', name: '胰岛素注射液', quantity: 200, unit: '支', unitPrice: 68 },
      ],
      priority: 'critical',
      status: 'in_transit',
      requestedDeliveryWindow: { start: new Date('2026-05-21T06:00:00'), end: new Date('2026-05-21T14:00:00') },
      totalWeight: 20,
      totalVolume: 0.15,
      totalAmount: 13600,
      temperatureRequirements: ['cold'],
      shippingAddress: {
        province: '上海', city: '上海', district: '静安区', detail: '某三甲医院',
        contactName: '王药师', contactPhone: '13700137002',
        location: { type: 'Point', coordinates: [121.4528, 31.2347] },
      },
      statusHistory: [{ status: 'pending', timestamp: new Date('2026-05-21T06:00:00'), operator: '系统', remark: '紧急订单' }],
    },
    {
      orderNo: 'MD202605210003',
      warehouseId: warehouses[1].code,
      items: [
        { sku: 'SKU-004', name: '氯化钠注射液', quantity: 3000, unit: '瓶', unitPrice: 3.5 },
        { sku: 'SKU-005', name: '葡萄糖注射液', quantity: 2000, unit: '瓶', unitPrice: 4.2 },
      ],
      priority: 'normal',
      status: 'processing',
      requestedDeliveryWindow: { start: new Date('2026-05-21T08:00:00'), end: new Date('2026-05-22T18:00:00') },
      totalWeight: 500,
      totalVolume: 3.5,
      totalAmount: 18900,
      temperatureRequirements: ['ambient'],
      shippingAddress: {
        province: '广东', city: '深圳', district: '南山区', detail: '某区级医院',
        contactName: '陈主任', contactPhone: '13700137003',
        location: { type: 'Point', coordinates: [113.9432, 22.5476] },
      },
      statusHistory: [{ status: 'pending', timestamp: new Date('2026-05-21T08:00:00'), operator: '系统', remark: '订单创建' }],
    },
    {
      orderNo: 'MD202605210004',
      warehouseId: warehouses[2].code,
      items: [
        { sku: 'SKU-006', name: '疫苗A', quantity: 500, unit: '支', unitPrice: 128 },
      ],
      priority: 'urgent',
      status: 'pending',
      requestedDeliveryWindow: { start: new Date('2026-05-21T10:00:00'), end: new Date('2026-05-22T10:00:00') },
      totalWeight: 10,
      totalVolume: 0.05,
      totalAmount: 64000,
      temperatureRequirements: ['frozen'],
      shippingAddress: {
        province: '北京', city: '北京', district: '海淀区', detail: '某疾控中心',
        contactName: '孙主任', contactPhone: '13700137004',
        location: { type: 'Point', coordinates: [116.2983, 39.9609] },
      },
      statusHistory: [{ status: 'pending', timestamp: new Date('2026-05-21T10:00:00'), operator: '系统', remark: '疫苗配送' }],
    },
    {
      orderNo: 'MD202605210005',
      warehouseId: warehouses[0].code,
      items: [
        { sku: 'SKU-007', name: '头孢克肟分散片', quantity: 800, unit: '盒', unitPrice: 22.3 },
      ],
      priority: 'normal',
      status: 'cancelled',
      requestedDeliveryWindow: { start: new Date('2026-05-21T08:00:00'), end: new Date('2026-05-22T18:00:00') },
      totalWeight: 60,
      totalVolume: 0.4,
      totalAmount: 17840,
      temperatureRequirements: ['ambient'],
      shippingAddress: {
        province: '上海', city: '上海', district: '闵行区', detail: '某药房',
        contactName: '林药师', contactPhone: '13700137005',
        location: { type: 'Point', coordinates: [121.3859, 31.1173] },
      },
      statusHistory: [],
    },
  ];
  const ordCol = db.collection('orders');
  await ordCol.deleteMany({});
  await ordCol.insertMany(orders as any);
  console.log(`✅ Orders: ${orders.length} 条`);

  // ============ 6. Inventory ============
  const now = new Date();
  const expiringSoon = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const inventoryItems = [
    { sku: 'SKU-001', name: '阿莫西林胶囊', category: '抗生素', specification: '0.5g×24粒', manufacturer: '某制药厂', approvalNumber: '国药准字H12345678', batchNo: 'B202605001', expiryDate: new Date('2027-05-01'), temperatureZone: 'ambient', quantity: 5000, warehouseId: warehouses[0].code, location: 'A-01-03', abcClass: 'A', unit: '盒', unitPrice: 12.5, safetyStock: 500, maxStock: 10000 },
    { sku: 'SKU-002', name: '布洛芬缓释胶囊', category: '解热镇痛', specification: '0.3g×20粒', manufacturer: '某药企', approvalNumber: '国药准字H87654321', batchNo: 'B202605002', expiryDate: new Date('2027-08-15'), temperatureZone: 'ambient', quantity: 3000, warehouseId: warehouses[0].code, location: 'A-02-01', abcClass: 'B', unit: '盒', unitPrice: 15.8, safetyStock: 300, maxStock: 5000 },
    { sku: 'SKU-003', name: '胰岛素注射液', category: '内分泌', specification: '300U/3ml', manufacturer: '某生物', approvalNumber: '国药准字S12345678', batchNo: 'B202605003', expiryDate: expiringSoon, temperatureZone: 'cold', quantity: 150, warehouseId: warehouses[0].code, location: 'C-01-01', abcClass: 'A', unit: '支', unitPrice: 68, safetyStock: 200, maxStock: 1000 },
    { sku: 'SKU-004', name: '氯化钠注射液', category: '输液类', specification: '0.9% 250ml', manufacturer: '某输液厂', approvalNumber: '国药准字H11223344', batchNo: 'B202605004', expiryDate: new Date('2028-03-01'), temperatureZone: 'ambient', quantity: 10000, warehouseId: warehouses[1].code, location: 'B-03-05', abcClass: 'A', unit: '瓶', unitPrice: 3.5, safetyStock: 2000, maxStock: 20000 },
    { sku: 'SKU-005', name: '葡萄糖注射液', category: '输液类', specification: '5% 500ml', manufacturer: '某输液厂', approvalNumber: '国药准字H55667788', batchNo: 'B202605005', expiryDate: new Date('2028-05-01'), temperatureZone: 'ambient', quantity: 500, warehouseId: warehouses[1].code, location: 'B-03-06', abcClass: 'B', unit: '瓶', unitPrice: 4.2, safetyStock: 1000, maxStock: 15000 },
    { sku: 'SKU-006', name: '疫苗A', category: '疫苗', specification: '0.5ml/支', manufacturer: '某生物所', approvalNumber: '国药准字S99887766', batchNo: 'B202605006', expiryDate: expiringSoon, temperatureZone: 'frozen', quantity: 50, warehouseId: warehouses[2].code, location: 'F-01-01', abcClass: 'A', unit: '支', unitPrice: 128, safetyStock: 100, maxStock: 5000 },
    { sku: 'SKU-007', name: '头孢克肟分散片', category: '抗生素', specification: '50mg×10片', manufacturer: '某药厂', approvalNumber: '国药准字H22334455', batchNo: 'B202605007', expiryDate: new Date('2027-06-01'), temperatureZone: 'ambient', quantity: 4000, warehouseId: warehouses[0].code, location: 'A-01-05', abcClass: 'A', unit: '盒', unitPrice: 22.3, safetyStock: 400, maxStock: 8000 },
    { sku: 'SKU-008', name: '维生素C片', category: '维生素', specification: '100mg×100片', manufacturer: '某药企', approvalNumber: '国药准字H99881122', batchNo: 'B202605008', expiryDate: new Date('2028-01-01'), temperatureZone: 'ambient', quantity: 2000, warehouseId: warehouses[0].code, location: 'A-03-01', abcClass: 'C', unit: '瓶', unitPrice: 9.8, safetyStock: 200, maxStock: 3000 },
  ];
  const invCol = db.collection('inventoryitems');
  await invCol.deleteMany({});
  await invCol.insertMany(inventoryItems);
  console.log(`✅ Inventory: ${inventoryItems.length} 条`);

  // ============ 7. Alerts ============
  const alerts = [
    { level: 'warning', type: 'low_stock', title: '疫苗A库存不足', message: '疫苗A当前库存50支，低于安全库存100支', inventoryId: 'SKU-006', warehouseId: warehouses[0].code, resolved: false },
    { level: 'critical', type: 'expiring', title: '胰岛素注射液即将过期', message: '胰岛素注射液将于15天后过期，当前库存150支', inventoryId: 'SKU-003', warehouseId: warehouses[0].code, resolved: false },
    { level: 'info', type: 'delay', title: '订单MD202605210002配送延迟', message: '冷链订单配送延迟30分钟', orderId: 'MD202605210004', resolved: false },
    { level: 'critical', type: 'temperature', title: '冷藏车温度异常', message: '沪A·12347 冷藏区温度升至10°C，超出2-8°C范围', resolved: true, resolvedAt: new Date(), resolvedBy: 'admin', resolutionNote: '已通知司机检查制冷设备' },
    { level: 'warning', type: 'vehicle_offline', title: '车辆离线告警', message: '沪A·12352 超过24小时未上报位置', resolved: false },
  ];
  const altCol = db.collection('alerts');
  await altCol.deleteMany({});
  await altCol.insertMany(alerts);
  console.log(`✅ Alerts: ${alerts.length} 条`);

  // ============ 8. Customers ============
  const customers = [
    {
      name: '上海仁济医院',
      code: 'CUST-001',
      type: 'hospital',
      address: {
        province: '上海', city: '上海', district: '黄浦区',
        detail: '山东中路145号',
        location: { type: 'Point', coordinates: [121.4855, 31.2341] },
      },
      contacts: [
        { name: '李主任', phone: '13600136001', role: '药剂科主任', isPrimary: true },
        { name: '王药师', phone: '13600136002', role: '采购专员', isPrimary: false },
      ],
      creditLevel: 5,
      ordersCount: 120,
      totalAmount: 2850000,
      enabled: true,
      businessLicense: { number: '91310000MA1K12345X', expiryDate: new Date('2028-12-31'), scope: '药品/医疗器械批发零售' },
      qualityCert: { gsp: true },
      temperatureRequirements: ['ambient', 'cool', 'cold'],
      receivingWindow: { weekdays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
      tags: [{ label: 'VIP客户' }, { label: '冷链需求' }],
    },
    {
      name: '上海中山医院',
      code: 'CUST-002',
      type: 'hospital',
      address: {
        province: '上海', city: '上海', district: '徐汇区',
        detail: '枫林路180号',
        location: { type: 'Point', coordinates: [121.4535, 31.1976] },
      },
      contacts: [
        { name: '张主任', phone: '13600136003', role: '药学部主任', isPrimary: true },
      ],
      creditLevel: 5,
      ordersCount: 85,
      totalAmount: 1680000,
      enabled: true,
      qualityCert: { gsp: true, gmp: true },
      temperatureRequirements: ['ambient', 'cool', 'cold', 'frozen'],
      receivingWindow: { weekdays: [1, 2, 3, 4, 5, 6], startTime: '07:00', endTime: '18:00' },
      tags: [{ label: '三甲医院' }],
    },
    {
      name: '北京协和医院',
      code: 'CUST-003',
      type: 'hospital',
      address: {
        province: '北京', city: '北京', district: '东城区',
        detail: '帅府园1号',
        location: { type: 'Point', coordinates: [116.4172, 39.9154] },
      },
      contacts: [
        { name: '刘主任', phone: '13600136004', role: '药剂科主任', isPrimary: true },
      ],
      creditLevel: 5,
      ordersCount: 200,
      totalAmount: 5200000,
      enabled: true,
      qualityCert: { gsp: true, gmp: true },
      temperatureRequirements: ['ambient', 'cool', 'cold', 'frozen'],
      receivingWindow: { weekdays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:30' },
      tags: [{ label: 'VIP客户' }, { label: '教学医院' }],
    },
    {
      name: '国大药房连锁',
      code: 'CUST-004',
      type: 'pharmacy',
      address: {
        province: '上海', city: '上海', district: '浦东新区',
        detail: '张江路168号1楼',
        location: { type: 'Point', coordinates: [121.5874, 31.2038] },
      },
      contacts: [
        { name: '陈经理', phone: '13600136005', role: '采购经理', isPrimary: true },
      ],
      creditLevel: 4,
      ordersCount: 60,
      totalAmount: 420000,
      enabled: true,
      temperatureRequirements: ['ambient', 'cool'],
      receivingWindow: { weekdays: [1, 2, 3, 4, 5, 6, 0], startTime: '09:00', endTime: '21:00' },
      tags: [{ label: '连锁药房' }],
    },
    {
      name: '九州通医药分销',
      code: 'CUST-005',
      type: 'distributor',
      address: {
        province: '广东', city: '广州', district: '白云区',
        detail: '太和镇民营科技园',
        location: { type: 'Point', coordinates: [113.3532, 23.2811] },
      },
      contacts: [
        { name: '黄总', phone: '13600136006', role: '副总经理', isPrimary: true },
        { name: '林经理', phone: '13600136007', role: '业务经理', isPrimary: false },
      ],
      creditLevel: 4,
      ordersCount: 150,
      totalAmount: 3800000,
      enabled: true,
      businessLicense: { number: '91440101MA5C12345Y', expiryDate: new Date('2030-06-30'), scope: '药品批发' },
      qualityCert: { gsp: true },
      temperatureRequirements: ['ambient'],
      receivingWindow: { weekdays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '18:00' },
      tags: [{ label: '一级经销商' }],
    },
  ];
  const custCol = db.collection('customers');
  await custCol.deleteMany({});
  const custResult = await custCol.insertMany(customers);
  console.log(`✅ Customers: ${customers.length} 条`);

  // ============ 9. Picking Tasks ============
  const today = '20260521';
  const pickingTasks = [
    {
      taskNo: `PK-${today}-0001`,
      warehouseId: warehouses[0].code,
      method: 'wave',
      status: 'completed',
      orderIds: ['MD202605210001', 'MD202605210002'],
      items: [
        { sku: 'SKU-001', name: '阿莫西林胶囊', orderNo: 'MD202605210001', location: 'A-01-03', pickQuantity: 1000, actualQuantity: 1000, batchNo: 'B202605001', expiryDate: new Date('2027-05-01') },
        { sku: 'SKU-002', name: '布洛芬缓释胶囊', orderNo: 'MD202605210001', location: 'A-02-01', pickQuantity: 500, actualQuantity: 500, batchNo: 'B202605002', expiryDate: new Date('2027-08-15') },
        { sku: 'SKU-003', name: '胰岛素注射液', orderNo: 'MD202605210002', location: 'C-01-01', pickQuantity: 200, actualQuantity: 200, batchNo: 'B202605003', expiryDate: new Date('2026-06-05') },
      ],
      assignedTo: users[2].username,
      zone: 'ZONE-A',
      priority: 9,
      startedAt: new Date('2026-05-21T08:30:00'),
      completedAt: new Date('2026-05-21T09:45:00'),
      waveNo: 'WAVE-20260521-001',
      totalItems: 3,
      pickedItems: 3,
      statusHistory: [
        { status: 'pending', timestamp: new Date('2026-05-21T08:00:00'), operator: '系统', remark: '波次拣货任务创建' },
        { status: 'in_progress', timestamp: new Date('2026-05-21T08:30:00'), operator: 'operator', remark: '开始拣货' },
        { status: 'completed', timestamp: new Date('2026-05-21T09:45:00'), operator: 'operator', remark: '拣货完成' },
      ],
    },
    {
      taskNo: `PK-${today}-0002`,
      warehouseId: warehouses[1].code,
      method: 'piece',
      status: 'in_progress',
      orderIds: ['MD202605210003'],
      items: [
        { sku: 'SKU-004', name: '氯化钠注射液', orderNo: 'MD202605210003', location: 'B-03-05', pickQuantity: 3000, batchNo: 'B202605004', expiryDate: new Date('2028-03-01') },
        { sku: 'SKU-005', name: '葡萄糖注射液', orderNo: 'MD202605210003', location: 'B-03-06', pickQuantity: 2000, batchNo: 'B202605005', expiryDate: new Date('2028-05-01') },
      ],
      assignedTo: null,
      zone: 'ZONE-B',
      priority: 5,
      startedAt: new Date('2026-05-21T10:00:00'),
      totalItems: 2,
      pickedItems: 1,
      statusHistory: [
        { status: 'pending', timestamp: new Date('2026-05-21T08:00:00'), operator: '系统', remark: '按单拣货' },
        { status: 'in_progress', timestamp: new Date('2026-05-21T10:00:00'), operator: 'operator', remark: '开始拣货' },
      ],
    },
    {
      taskNo: `PK-${today}-0003`,
      warehouseId: warehouses[2].code,
      method: 'batch',
      status: 'pending',
      orderIds: ['MD202605210004'],
      items: [
        { sku: 'SKU-006', name: '疫苗A', orderNo: 'MD202605210004', location: 'F-01-01', pickQuantity: 500, batchNo: 'B202605006', expiryDate: new Date('2026-06-05') },
      ],
      zone: 'ZONE-F',
      priority: 10,
      totalItems: 1,
      pickedItems: 0,
      statusHistory: [
        { status: 'pending', timestamp: new Date('2026-05-21T10:00:00'), operator: '系统', remark: '急救疫苗，最高优先级' },
      ],
    },
  ];
  const pkCol = db.collection('pickingtasks');
  await pkCol.deleteMany({});
  await pkCol.insertMany(pickingTasks as any);
  console.log(`✅ PickingTasks: ${pickingTasks.length} 条`);

  // ============ 10. Dispatch Tasks ============
  const dispatchTasks = [
    {
      taskNo: `DP-${today}-0001`,
      vehicleId: vehicles[1].plateNumber,
      driverId: drivers[1].licenseNumber,
      warehouseId: warehouses[0].code,
      orderIds: ['MD202605210001', 'MD202605210002'],
      status: 'departed',
      priority: 'normal',
      totalWeight: 170,
      totalVolume: 0.95,
      orderCount: 2,
      estimatedDistance: 25000,
      estimatedDuration: 3600,
      departureTime: new Date('2026-05-21T10:00:00'),
      temperatureZones: ['ambient', 'cold'],
      statusHistory: [
        { status: 'pending', timestamp: new Date('2026-05-21T08:00:00'), operator: '系统', remark: '调度任务创建' },
        { status: 'assigned', timestamp: new Date('2026-05-21T08:30:00'), operator: 'manager', remark: '分配车辆沪A·12346和赵师傅' },
        { status: 'loading', timestamp: new Date('2026-05-21T09:00:00'), operator: 'operator', remark: '开始装货' },
        { status: 'departed', timestamp: new Date('2026-05-21T10:00:00'), operator: 'operator', remark: '发车' },
      ],
      route: {
        stops: [
          { sequence: 1, orderId: 'MD202605210001', type: 'delivery', address: { province: '上海', city: '上海', district: '徐汇区', detail: '某社区医院', contactName: '张医生', contactPhone: '13700137001', location: { type: 'Point', coordinates: [121.4431, 31.1941] } }, estimatedArrival: new Date('2026-05-21T10:45:00'), estimatedDeparture: new Date('2026-05-21T11:15:00'), serviceTime: 1800, distanceFromPrev: 15000, status: 'arrived', actualArrival: new Date('2026-05-21T10:40:00') },
          { sequence: 2, orderId: 'MD202605210002', type: 'delivery', address: { province: '上海', city: '上海', district: '静安区', detail: '某三甲医院', contactName: '王药师', contactPhone: '13700137002', location: { type: 'Point', coordinates: [121.4528, 31.2347] } }, estimatedArrival: new Date('2026-05-21T11:45:00'), estimatedDeparture: new Date('2026-05-21T12:00:00'), serviceTime: 900, distanceFromPrev: 10000, status: 'pending' },
        ],
        totalDistance: 25000,
        totalDuration: 3600,
        algorithm: 'nearest_neighbor',
        trafficConsidered: false,
      },
    },
    {
      taskNo: `DP-${today}-0002`,
      vehicleId: vehicles[2].plateNumber,
      driverId: null,
      warehouseId: warehouses[1].code,
      orderIds: ['MD202605210003'],
      status: 'pending',
      priority: 'normal',
      totalWeight: 500,
      totalVolume: 3.5,
      orderCount: 1,
      estimatedDistance: 0,
      estimatedDuration: 0,
      temperatureZones: ['ambient'],
      statusHistory: [
        { status: 'pending', timestamp: new Date('2026-05-21T08:00:00'), operator: '系统', remark: '等待分配司机' },
      ],
    },
    {
      taskNo: `DP-${today}-0003`,
      vehicleId: vehicles[5].plateNumber,
      driverId: drivers[5].licenseNumber,
      warehouseId: warehouses[2].code,
      orderIds: ['MD202605210004'],
      status: 'assigned',
      priority: 'critical',
      totalWeight: 10,
      totalVolume: 0.05,
      orderCount: 1,
      estimatedDistance: 35000,
      estimatedDuration: 4800,
      temperatureZones: ['frozen'],
      notes: '疫苗冷链配送，全程-18°C以下',
      statusHistory: [
        { status: 'pending', timestamp: new Date('2026-05-21T09:00:00'), operator: '系统', remark: '急救疫苗紧急调度' },
        { status: 'assigned', timestamp: new Date('2026-05-21T09:30:00'), operator: 'manager', remark: '分配冷藏车沪A·12350和吴师傅' },
      ],
    },
  ];
  const dpCol = db.collection('dispatchtasks');
  await dpCol.deleteMany({});
  await dpCol.insertMany(dispatchTasks as any);
  console.log(`✅ DispatchTasks: ${dispatchTasks.length} 条`);

  // ============ 11. Route Plans ============
  const routePlans = [
    {
      dispatchId: dispatchTasks[0].taskNo,
      vehicleId: vehicles[1].plateNumber,
      stops: [
        { sequence: 1, orderId: 'MD202605210001', type: 'delivery' as const, address: { province: '上海', city: '上海', district: '徐汇区', detail: '某社区医院', contactName: '张医生', contactPhone: '13700137001', location: { type: 'Point', coordinates: [121.4431, 31.1941] } }, estimatedArrival: new Date('2026-05-21T10:45:00'), estimatedDeparture: new Date('2026-05-21T11:15:00'), serviceTime: 1800, distanceFromPrev: 15000 },
        { sequence: 2, orderId: 'MD202605210002', type: 'delivery' as const, address: { province: '上海', city: '上海', district: '静安区', detail: '某三甲医院', contactName: '王药师', contactPhone: '13700137002', location: { type: 'Point', coordinates: [121.4528, 31.2347] } }, estimatedArrival: new Date('2026-05-21T11:45:00'), estimatedDeparture: new Date('2026-05-21T12:00:00'), serviceTime: 900, distanceFromPrev: 10000 },
      ],
      totalDistance: 25000,
      totalDuration: 3600,
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.5444, 31.2353], [121.5100, 31.2200], [121.4431, 31.1941],
          [121.4480, 31.2150], [121.4528, 31.2347],
        ],
      },
      algorithm: 'nearest_neighbor',
      trafficConsidered: false,
      calculatedAt: new Date('2026-05-21T08:15:00'),
    },
    {
      dispatchId: dispatchTasks[2].taskNo,
      vehicleId: vehicles[5].plateNumber,
      stops: [
        { sequence: 1, orderId: 'MD202605210004', type: 'delivery' as const, address: { province: '北京', city: '北京', district: '海淀区', detail: '某疾控中心', contactName: '孙主任', contactPhone: '13700137004', location: { type: 'Point', coordinates: [116.2983, 39.9609] } }, estimatedArrival: new Date('2026-05-22T04:00:00'), estimatedDeparture: new Date('2026-05-22T04:30:00'), serviceTime: 1800, distanceFromPrev: 35000 },
      ],
      totalDistance: 35000,
      totalDuration: 4800,
      algorithm: 'astar',
      trafficConsidered: true,
      trafficComparison: {
        noTraffic: { distance: 32000, duration: 3600 },
        withTraffic: { distance: 35000, duration: 4800 },
        trafficRatio: 1.33,
      },
      calculatedAt: new Date('2026-05-21T09:15:00'),
    },
  ];
  const rtCol = db.collection('routeplans');
  await rtCol.deleteMany({});
  const rtResult = await rtCol.insertMany(routePlans as any);
  console.log(`✅ RoutePlans: ${routePlans.length} 条`);

  // ============ 12. GPS Tracks ============
  const gpsTracks = [
    {
      vehicleId: vehicles[1].plateNumber,
      dispatchId: dispatchTasks[0].taskNo,
      driverId: drivers[1].licenseNumber,
      timestamp: new Date('2026-05-21T10:15:00'),
      location: { type: 'Point', coordinates: [121.5100, 31.2200] },
      speed: 45,
      heading: 180,
      accuracy: 5,
      cumulativeDistance: 8500,
    },
    {
      vehicleId: vehicles[1].plateNumber,
      dispatchId: dispatchTasks[0].taskNo,
      driverId: drivers[1].licenseNumber,
      timestamp: new Date('2026-05-21T10:30:00'),
      location: { type: 'Point', coordinates: [121.4480, 31.2000] },
      speed: 42,
      heading: 175,
      accuracy: 8,
      cumulativeDistance: 14000,
    },
    {
      vehicleId: vehicles[1].plateNumber,
      dispatchId: dispatchTasks[0].taskNo,
      driverId: drivers[1].licenseNumber,
      timestamp: new Date('2026-05-21T10:40:00'),
      location: { type: 'Point', coordinates: [121.4431, 31.1941] },
      speed: 0,
      heading: 270,
      accuracy: 3,
      cumulativeDistance: 15000,
      address: { formattedAddress: '上海市徐汇区枫林路180号', province: '上海', city: '上海', district: '徐汇区', street: '枫林路', number: '180号' },
    },
    {
      vehicleId: vehicles[5].plateNumber,
      dispatchId: dispatchTasks[2].taskNo,
      driverId: drivers[5].licenseNumber,
      timestamp: new Date('2026-05-21T10:00:00'),
      location: { type: 'Point', coordinates: [116.6535, 40.1285] },
      speed: 0,
      heading: 90,
      accuracy: 4,
      cumulativeDistance: 0,
    },
  ];
  const gpsCol = db.collection('gpstracks');
  await gpsCol.deleteMany({});
  await gpsCol.insertMany(gpsTracks as any);
  console.log(`✅ GPSTracks: ${gpsTracks.length} 条`);

  // ============ 13. Cold Chain Records ============
  const coldChainRecords = [
    {
      dispatchId: dispatchTasks[0].taskNo,
      vehicleId: vehicles[1].plateNumber,
      orderIds: ['MD202605210002'],
      timestamp: new Date('2026-05-21T09:30:00'),
      temperature: 4.5,
      humidity: 55,
      zone: 'cold',
      rangeLimit: { min: 2, max: 8, unit: '°C' },
      withinRange: true,
      alertStatus: 'normal',
      sensor: { sensorId: 'SENSOR-001', position: '后厢中部' },
    },
    {
      dispatchId: dispatchTasks[0].taskNo,
      vehicleId: vehicles[1].plateNumber,
      orderIds: ['MD202605210002'],
      timestamp: new Date('2026-05-21T10:00:00'),
      temperature: 5.2,
      humidity: 52,
      zone: 'cold',
      rangeLimit: { min: 2, max: 8, unit: '°C' },
      withinRange: true,
      alertStatus: 'normal',
      sensor: { sensorId: 'SENSOR-001', position: '后厢中部' },
    },
    {
      dispatchId: dispatchTasks[0].taskNo,
      vehicleId: vehicles[1].plateNumber,
      orderIds: ['MD202605210002'],
      timestamp: new Date('2026-05-21T10:30:00'),
      temperature: 7.8,
      humidity: 48,
      zone: 'cold',
      rangeLimit: { min: 2, max: 8, unit: '°C' },
      withinRange: true,
      alertStatus: 'warning',
      sensor: { sensorId: 'SENSOR-001', position: '后厢中部' },
      doorOpenCount: 1,
      compressorRuntime: 45,
    },
    {
      dispatchId: dispatchTasks[2].taskNo,
      vehicleId: vehicles[5].plateNumber,
      orderIds: ['MD202605210004'],
      timestamp: new Date('2026-05-21T09:45:00'),
      temperature: -20.5,
      zone: 'frozen',
      rangeLimit: { min: -25, max: -15, unit: '°C' },
      withinRange: true,
      alertStatus: 'normal',
      sensor: { sensorId: 'SENSOR-002', position: '前厢左侧' },
    },
  ];
  const ccCol = db.collection('coldchainrecords');
  await ccCol.deleteMany({});
  await ccCol.insertMany(coldChainRecords as any);
  console.log(`✅ ColdChainRecords: ${coldChainRecords.length} 条`);

  console.log('\n🎉 种子数据初始化完成!');
  console.log('\n📋 测试账号:');
  console.log('  admin / admin123  (管理员)');
  console.log('  manager / manager123 (经理)');
  console.log('  operator / operator123 (操作员)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
