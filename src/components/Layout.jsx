import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Film, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Ticket,
  Popcorn,
  Calendar,
  UserCircle,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: TrendingUp, label: 'Tableau de bord', roles: ['cashier', 'manager', 'admin'] },
    { path: '/tickets', icon: Ticket, label: 'Billetterie', roles: ['cashier', 'manager', 'admin'] },
    { path: '/snacks', icon: Popcorn, label: 'Confiserie', roles: ['cashier', 'manager', 'admin'] },
    { path: '/cart', icon: ShoppingCart, label: 'Panier', roles: ['cashier', 'manager', 'admin'] },
    { path: '/movies', icon: Film, label: 'Films', roles: ['manager', 'admin'] },
    { path: '/sessions', icon: Calendar, label: 'Séances', roles: ['manager', 'admin'] },
    { path: '/customers', icon: Users, label: 'Clients', roles: ['cashier', 'manager', 'admin'] },
    { path: '/stock', icon: Package, label: 'Stocks', roles: ['manager', 'admin'] },
    { path: '/statistics', icon: TrendingUp, label: 'Statistiques', roles: ['manager', 'admin'] },
    { path: '/staff', icon: UserCircle, label: 'Personnel', roles: ['admin'] },
    { path: '/settings', icon: SettingsIcon, label: 'Paramètres', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles?.includes(userProfile?.role)
  );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed lg:relative w-70 bg-gray-900 border-r border-gray-800 z-50 h-screen flex flex-col"
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Film className="w-8 h-8 text-red-500" />
                <span className="text-white font-bold text-xl">Ciné Gestion</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 h-12 text-base ${
                      isActive 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-800">
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Connecté en tant que</p>
                <p className="text-white font-medium">{userProfile?.full_name}</p>
                <p className="text-xs text-red-400 uppercase mt-1">{userProfile?.role}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start gap-3 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-white text-2xl font-bold">{title}</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">{userProfile?.full_name}</p>
              <p className="text-xs text-red-400 uppercase">{userProfile?.role}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;