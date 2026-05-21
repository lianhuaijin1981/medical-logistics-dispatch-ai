import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@med/ui-components';
import AppLayout from './layouts/AppLayout';
import { Loading } from '@med/ui-components';

// Lazy-load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OrderManagement = lazy(() => import('./pages/orders/OrderManagement'));
const WarehouseOverview = lazy(() => import('./pages/warehouse/WarehouseOverview'));
const DispatchCenter = lazy(() => import('./pages/dispatch/DispatchCenter'));
const VehicleTracking = lazy(() => import('./pages/tracking/VehicleTracking'));
const ColdChainMonitor = lazy(() => import('./pages/coldchain/ColdChainMonitor'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading text="页面加载中..." size="lg" />}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:status" element={<OrderManagement />} />
            <Route path="warehouse" element={<WarehouseOverview />} />
            <Route path="dispatch" element={<DispatchCenter />} />
            <Route path="tracking" element={<VehicleTracking />} />
            <Route path="cold-chain" element={<ColdChainMonitor />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
