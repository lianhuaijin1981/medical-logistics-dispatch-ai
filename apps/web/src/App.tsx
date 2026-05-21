import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@med/ui-components';
import { Loading } from '@med/ui-components';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

// Lazy-load pages
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OrderManagement = lazy(() => import('./pages/orders/OrderManagement'));
const WarehouseOverview = lazy(() => import('./pages/warehouse/WarehouseOverview'));
const DispatchCenter = lazy(() => import('./pages/dispatch/DispatchCenter'));
const VehicleTracking = lazy(() => import('./pages/tracking/VehicleTracking'));
const VehicleManagement = lazy(() => import('./pages/vehicles/VehicleManagement'));
const DriverManagement = lazy(() => import('./pages/drivers/DriverManagement'));
const CustomerManagement = lazy(() => import('./pages/customers/CustomerManagement'));
const ColdChainMonitor = lazy(() => import('./pages/coldchain/ColdChainMonitor'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading text="页面加载中..." size="lg" />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:status" element={<OrderManagement />} />
            <Route path="warehouse" element={<WarehouseOverview />} />
            <Route path="dispatch" element={<DispatchCenter />} />
            <Route path="tracking" element={<VehicleTracking />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="drivers" element={<DriverManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
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
