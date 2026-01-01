import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Ticket, Popcorn, TrendingUp, AlertTriangle, DollarSign, Users, Film, Calendar, Clock, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayTickets: 0,
    activeSessions: 0,
    lowStock: 0,
    occupancyRate: 0
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's orders & revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .eq('status', 'completed');

      const todayRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

      // Fetch active sessions for today
      const { data: activeSessions } = await supabase
        .from('sessions')
        .select('*, movies(title, poster_url), rooms(name, capacity)')
        .eq('session_date', today)
        .eq('is_active', true)
        .order('session_time');

      // Calculate simplified occupancy
      let totalCapacity = 0;
      let totalOccupied = 0;
      activeSessions?.forEach(s => {
          totalCapacity += s.rooms?.capacity || 0;
          totalOccupied += s.occupied_seats?.length || 0;
      });
      const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

      // Fetch low stock items
      const { count: lowStockCount } = await supabase
        .from('snacks')
        .select('id', { count: 'exact', head: true })
        .lt('stock_quantity', 20); // Using constant for demo logic

      setStats({
        todayRevenue,
        todayTickets: totalOccupied, // Approx logic for demo
        activeSessions: activeSessions?.length || 0,
        lowStock: lowStockCount || 0,
        occupancyRate
      });

      setSessions(activeSessions?.slice(0, 4) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: DollarSign, label: "Recettes du jour", value: `${stats.todayRevenue.toFixed(2)} €`, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { icon: Ticket, label: 'Billets vendus', value: stats.todayTickets, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { icon: Users, label: "Taux d'occupation", value: `${stats.occupancyRate}%`, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { icon: AlertTriangle, label: 'Alertes', value: stats.lowStock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  ];

  return (
    <>
      <Helmet>
        <title>Tableau de bord - Ciné Gestion</title>
      </Helmet>

      <Layout title="Tableau de bord">
        <div className="space-y-8">
          
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-900 border ${stat.border} rounded-xl p-6 relative overflow-hidden`}
                >
                  <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl`} />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
                      <p className="text-white text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {/* Active Sessions List */}
             <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                   <h2 className="text-white text-xl font-bold flex items-center gap-2">
                      <Film className="w-5 h-5 text-red-500" /> À l'affiche
                   </h2>
                   <Button variant="link" className="text-red-500" onClick={() => navigate('/sessions')}>Voir tout</Button>
                </div>
                
                {sessions.length === 0 ? (
                   <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
                      Aucune séance prévue aujourd'hui.
                   </div>
                ) : (
                   <div className="grid gap-4">
                      {sessions.map((session, i) => (
                         <motion.div 
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gray-900 border border-gray-800 hover:border-red-600/50 transition-colors p-4 rounded-xl flex items-center gap-4 group cursor-pointer"
                            onClick={() => navigate('/tickets')}
                         >
                            <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                               <img alt={session.movies?.title} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1529680713471-db81b5138164" />
                            </div>
                            <div className="flex-1">
                               <h3 className="text-white font-bold">{session.movies?.title}</h3>
                               <div className="flex items-center gap-3 text-sm text-gray-400">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.session_time.substring(0,5)}</span>
                                  <span className="bg-gray-800 px-2 rounded text-xs text-gray-300">{session.rooms?.name}</span>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className="text-2xl font-bold text-white block">{session.available_seats}</span>
                               <span className="text-xs text-gray-500 uppercase">Places Restantes</span>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                         </motion.div>
                      ))}
                   </div>
                )}
             </div>

             {/* Quick Actions / Stock Alerts */}
             <div className="space-y-6">
                <div>
                   <h2 className="text-white text-xl font-bold mb-4">Actions rapides</h2>
                   <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => navigate('/tickets')} className="h-24 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 flex-col gap-2 rounded-xl">
                         <Ticket className="w-8 h-8" /> <span>Vendre Billets</span>
                      </Button>
                      <Button onClick={() => navigate('/snacks')} className="h-24 bg-gray-800 hover:bg-gray-700 border border-gray-700 flex-col gap-2 rounded-xl">
                         <Popcorn className="w-8 h-8 text-yellow-500" /> <span>Confiserie</span>
                      </Button>
                      <Button onClick={() => navigate('/customers')} className="h-20 bg-gray-900 border border-gray-800 hover:bg-gray-800 flex-col gap-1 rounded-xl">
                         <Users className="w-5 h-5 text-blue-500" /> <span className="text-sm">Clients</span>
                      </Button>
                      <Button onClick={() => navigate('/stock')} className="h-20 bg-gray-900 border border-gray-800 hover:bg-gray-800 flex-col gap-1 rounded-xl">
                         <AlertTriangle className="w-5 h-5 text-orange-500" /> <span className="text-sm">Stocks</span>
                      </Button>
                   </div>
                </div>

                {stats.lowStock > 0 && (
                   <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-4 flex items-start gap-4">
                      <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                      <div>
                         <h4 className="text-white font-bold">Attention Stock</h4>
                         <p className="text-sm text-gray-400 mt-1">{stats.lowStock} articles sont en stock faible ou proche de l'expiration.</p>
                         <Button size="sm" variant="link" className="text-yellow-500 p-0 h-auto mt-2" onClick={() => navigate('/stock')}>Vérifier Stock</Button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;