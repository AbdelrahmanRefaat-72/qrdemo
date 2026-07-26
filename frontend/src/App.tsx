import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerMenu } from './pages/CustomerMenu';
import { OrderTrackerPage } from './pages/OrderTrackerPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { KitchenDashboard } from './pages/KitchenDashboard';
import { WaiterDashboard } from './pages/WaiterDashboard';
import { CashierDashboard } from './pages/CashierDashboard';
import { useAuthStore } from './store/useAuthStore';
import { UserRole } from './types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, user } = useAuthStore();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Customer Menu Routes */}
        <Route path="/" element={<CustomerMenu />} />
        <Route path="/table/:tableNum" element={<CustomerMenu />} />
        <Route path="/order/:orderId" element={<OrderTrackerPage />} />

        {/* Staff Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Staff Dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'KITCHEN']}>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}>
              <WaiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']}>
              <CashierDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
