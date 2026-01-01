import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import TicketSales from '@/pages/TicketSales';
import SnackSales from '@/pages/SnackSales';
import Cart from '@/pages/Cart';
import MovieManagement from '@/pages/MovieManagement';
import SessionManagement from '@/pages/SessionManagement';
import CustomerManagement from '@/pages/CustomerManagement';
import StaffManagement from '@/pages/StaffManagement';
import Statistics from '@/pages/Statistics';
import StockManagement from '@/pages/StockManagement';
import Settings from '@/pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketSales /></ProtectedRoute>} />
          <Route path="/snacks" element={<ProtectedRoute><SnackSales /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/movies" element={<ProtectedRoute requiredRole="manager"><MovieManagement /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute requiredRole="manager"><SessionManagement /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute requiredRole="admin"><StaffManagement /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute requiredRole="manager"><Statistics /></ProtectedRoute>} />
          <Route path="/stock" element={<ProtectedRoute requiredRole="manager"><StockManagement /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;