import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { 
  UserCircle, Plus, Clock, Shield, Search, TrendingUp, Calendar, Trash2, Edit, Save, X, DollarSign, Award, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StaffManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list'); // list, schedule, stats
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // New Employee Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'cashier',
    pin_code: '',
    hourly_rate: '',
    badge_code: '',
    is_active: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger le personnel." });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        const { error } = await supabase
          .from('users')
          .update(formData)
          .eq('id', editingEmployee.id);
        if (error) throw error;
        toast({ title: "Succès", description: "Employé mis à jour." });
      } else {
        const { error } = await supabase
          .from('users')
          .insert([formData]);
        if (error) throw error;
        toast({ title: "Succès", description: "Nouvel employé ajouté." });
      }
      setShowAddModal(false);
      setEditingEmployee(null);
      fetchStaff();
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Échec de l'enregistrement." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Supprimé", description: "Employé supprimé avec succès." });
      fetchStaff();
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer (peut-être lié à des ventes)." });
    }
  };

  const openEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      email: employee.email,
      role: employee.role,
      pin_code: employee.pin_code,
      hourly_rate: employee.hourly_rate || '',
      badge_code: employee.badge_code || '',
      is_active: employee.is_active
    });
    setShowAddModal(true);
  };

  const filteredStaff = staff.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Gestion du Personnel - Ciné Gestion</title>
      </Helmet>

      <Layout title="Ressources Humaines">
        <div className="space-y-6">
          
          {/* Top Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800 w-full md:w-auto">
              {['list', 'schedule', 'stats'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab === 'list' && 'Liste Employés'}
                  {tab === 'schedule' && 'Planning'}
                  {tab === 'stats' && 'Performances'}
                </button>
              ))}
            </div>
            
            {activeTab === 'list' && (
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600" 
                    placeholder="Rechercher un employé..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => { setEditingEmployee(null); setFormData({ full_name: '', email: '', role: 'cashier', pin_code: '', hourly_rate: '', badge_code: '', is_active: true }); setShowAddModal(true); }} className="bg-red-600 hover:bg-red-700 gap-2 whitespace-nowrap">
                  <Plus className="w-4 h-4"/> <span className="hidden sm:inline">Ajouter</span>
                </Button>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="min-h-[600px]">
            {activeTab === 'list' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredStaff.map((employee) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={employee.id} 
                    className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-900/50 transition-colors group"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                            employee.role === 'admin' ? 'bg-red-900/30 text-red-500' : 
                            employee.role === 'manager' ? 'bg-purple-900/30 text-purple-500' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {employee.full_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{employee.full_name}</h3>
                            <div className="flex items-center gap-2">
                               <span className="text-xs uppercase tracking-wider text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{employee.role}</span>
                               <span className={`w-2 h-2 rounded-full ${employee.is_active ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-red-500'}`} />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => openEdit(employee)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {employee.role !== 'admin' && (
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(employee.id)}>
                                <Trash2 className="w-4 h-4" />
                             </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mt-6 pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-gray-500 mb-1">Code Badge</p>
                          <p className="text-white font-mono">{employee.badge_code || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Taux Horaire</p>
                          <p className="text-white font-mono">{employee.hourly_rate ? `${employee.hourly_rate} €/h` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Email</p>
                          <p className="text-white truncate">{employee.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Dernière Connexion</p>
                          <p className="text-white">{employee.last_sign_in_at ? new Date(employee.last_sign_in_at).toLocaleDateString() : 'Jamais'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats Footer */}
                    <div className="bg-gray-800/50 p-3 flex justify-between items-center text-xs text-gray-400">
                       <div className="flex items-center gap-1">
                          <History className="w-3 h-3" /> Embauché le: {new Date(employee.created_at).toLocaleDateString()}
                       </div>
                       <div className="flex items-center gap-1 text-green-400">
                          <TrendingUp className="w-3 h-3" /> Actif
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Planning Hebdomadaire</h3>
                <p className="text-gray-400 max-w-md mx-auto">La fonctionnalité de gestion complète des plannings avec glisser-déposer sera disponible dans la prochaine mise à jour.</p>
                <Button className="mt-6" variant="outline">Télécharger le planning PDF</Button>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Top Performer Card */}
                 <div className="bg-gradient-to-br from-yellow-900/20 to-gray-900 border border-yellow-700/30 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Award className="w-24 h-24 text-yellow-500" /></div>
                    <h3 className="text-yellow-500 font-bold uppercase tracking-widest mb-4">Employé du mois</h3>
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center text-2xl font-bold text-white">M</div>
                       <div>
                          <p className="text-2xl font-bold text-white">Marin Jarnac</p>
                          <p className="text-yellow-400">Total Ventes: 14,250 €</p>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-sm text-gray-400">
                          <span>Objectif Mensuel</span>
                          <span>95%</span>
                       </div>
                       <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 w-[95%]"></div>
                       </div>
                    </div>
                 </div>

                 {/* Sales Distribution */}
                 <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500"/> Ventes par Rôle</h3>
                    <div className="space-y-4">
                       {['Caissiers', 'Managers', 'Bornes Auto'].map((label, i) => (
                          <div key={label} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                             <span className="text-gray-300">{label}</span>
                             <span className="text-white font-mono font-bold">{[12500, 4200, 8900][i]} €</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-800/30">
                  <h2 className="text-xl font-bold text-white">
                    {editingEmployee ? 'Modifier Employé' : 'Nouvel Employé'}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></Button>
                </div>
                
                <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-400 block mb-1">Nom Complet</label>
                      <input 
                        required
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:outline-none"
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-400 block mb-1">Code PIN (Connexion)</label>
                      <input 
                        required
                        type="text"
                        maxLength="4"
                        pattern="\d{4}"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white font-mono text-center tracking-widest focus:border-red-600 focus:outline-none"
                        value={formData.pin_code}
                        onChange={e => setFormData({...formData, pin_code: e.target.value.replace(/\D/g,'')})}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-400 block mb-1">Rôle</label>
                      <select 
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:outline-none appearance-none"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                      >
                        <option value="cashier">Caissier</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-400 block mb-1">Email</label>
                      <input 
                        type="email"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:outline-none"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400 block mb-1">Badge ID</label>
                      <input 
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:outline-none"
                        value={formData.badge_code}
                        onChange={e => setFormData({...formData, badge_code: e.target.value})}
                        placeholder="SCAN-123"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400 block mb-1">Taux Horaire (€)</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:outline-none"
                        value={formData.hourly_rate}
                        onChange={e => setFormData({...formData, hourly_rate: e.target.value})}
                      />
                    </div>
                    
                    <div className="col-span-2 flex items-center gap-3 mt-2 bg-gray-950 p-3 rounded-lg border border-gray-800">
                      <input 
                        type="checkbox"
                        id="activeStatus"
                        className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500 bg-gray-800"
                        checked={formData.is_active}
                        onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      />
                      <label htmlFor="activeStatus" className="text-white cursor-pointer select-none">Compte Actif (peut se connecter)</label>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)}>Annuler</Button>
                    <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">Enregistrer</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Layout>
    </>
  );
};

export default StaffManagement;