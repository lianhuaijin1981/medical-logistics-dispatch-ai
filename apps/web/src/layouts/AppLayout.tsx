import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@med/shared-utils';

const navItems = [
  { path: '/dashboard', label: '运营大盘', icon: '📊' },
  { path: '/orders', label: '订单管理', icon: '📋' },
  { path: '/warehouse', label: '仓储管理', icon: '🏭' },
  { path: '/vehicles', label: '车辆管理', icon: '🚚' },
  { path: '/drivers', label: '司机管理', icon: '👤' },
  { path: '/dispatch', label: '调度中心', icon: '🚛' },
  { path: '/tracking', label: '车辆追踪', icon: '📍' },
  { path: '/cold-chain', label: '冷链监控', icon: '🌡️' },
  { path: '/analytics', label: '数据分析', icon: '📈' },
];

const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-white border-r border-gray-200 transition-all duration-200',
          sidebarCollapsed ? 'w-16' : 'w-56',
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            药
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 font-semibold text-gray-900 text-sm whitespace-nowrap">
              医药物流调度
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 text-gray-400"
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
