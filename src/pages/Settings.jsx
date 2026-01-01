import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { 
  Settings as SettingsIcon, Building, CreditCard, Receipt, Printer, Database, Save, Lock, Smartphone, Globe
} from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('company');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company: { name: '', address: '', siret: '', phone: '', email: '', vat_number: '' },
    pricing: { full: 12, student: 9, child: 7, senior: 8.5, surcharge_3d: 2, surcharge_imax: 4 },
    receipt: { header: 'Bienvenue au Cinéma', footer: 'Merci de votre visite', printer_ip: '192.168.1.200' },
    taxes: { vat_ticket: 5.5, vat_snack: 10, currency: 'EUR' }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      
      const newSettings = { ...settings };
      data.forEach(item => {
        if (item.key === 'company_info') newSettings.company = item.value;
        if (item.key === 'pricing') newSettings.pricing = item.value;
        if (item.key === 'receipt') newSettings.receipt = item.value;
        if (item.key === 'taxes') newSettings.taxes = item.value;
      });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error loading settings', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const updates = [
        { key: 'company_info', value: settings.company, description: 'Company Info' },
        { key: 'pricing', value: settings.pricing, description: 'Pricing Config' },
        { key: 'receipt', value: settings.receipt, description: 'Receipt Config' },
        { key: 'taxes', value: settings.taxes, description: 'Tax Config' },
      ];

      for (const update of updates) {
        await supabase.from('settings').upsert(update, { onConflict: 'key' });
      }

      toast({ title: "Sauvegardé", description: "Paramètres mis à jour avec succès." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Échec de la sauvegarde." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const navItems = [
    { id: 'company', icon: Building, label: 'Entreprise' },
    { id: 'pricing', icon: CreditCard, label: 'Tarification' },
    { id: 'receipt', icon: Receipt, label: 'Tickets & Reçus' },
    { id: 'taxes', icon: Database, label: 'Taxes & Devise' },
    { id: 'system', icon: Lock, label: 'Système & Sécurité' },
  ];

  return (
    <>
      <Helmet>
        <title>Paramètres - Ciné Gestion</title>
      </Helmet>

      <Layout title="Configuration Système">
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
          
          {/* Sidebar Nav */}
          <div className="lg:w-64 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl p-4 h-full overflow-y-auto">
            <h3 className="text-gray-500 uppercase text-xs font-bold mb-4 px-2">Général</h3>
            <div className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === item.id 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-800">
               <h3 className="text-gray-500 uppercase text-xs font-bold mb-4 px-2">Maintenance</h3>
               <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors">
                  <Database className="w-4 h-4" /> Sauvegarde BDD
               </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-8 overflow-y-auto relative">
             <div className="absolute top-6 right-6">
                <Button 
                   onClick={saveSettings} 
                   disabled={loading}
                   className="bg-green-600 hover:bg-green-700 gap-2 shadow-lg shadow-green-900/20"
                >
                   <Save className="w-4 h-4" /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
             </div>

             <div className="max-w-3xl">
                {activeSection === 'company' && (
                   <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                         <Building className="w-6 h-6 text-red-500" /> Informations Entreprise
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nom de l'établissement</label>
                            <input 
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                               value={settings.company.name}
                               onChange={(e) => handleChange('company', 'name', e.target.value)}
                            />
                         </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Adresse</label>
                            <input 
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                               value={settings.company.address}
                               onChange={(e) => handleChange('company', 'address', e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">SIRET</label>
                            <input 
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                               value={settings.company.siret}
                               onChange={(e) => handleChange('company', 'siret', e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Numéro TVA</label>
                            <input 
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                               value={settings.company.vat_number}
                               onChange={(e) => handleChange('company', 'vat_number', e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Téléphone</label>
                            <input 
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                               value={settings.company.phone}
                               onChange={(e) => handleChange('company', 'phone', e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Contact</label>
                            <input 
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                               value={settings.company.email}
                               onChange={(e) => handleChange('company', 'email', e.target.value)}
                            />
                         </div>
                      </div>
                   </div>
                )}

                {activeSection === 'pricing' && (
                   <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                         <CreditCard className="w-6 h-6 text-red-500" /> Tarification Billetterie
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Plein Tarif (€)</label>
                            <input 
                               type="number" step="0.10"
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none text-right font-mono text-lg"
                               value={settings.pricing.full}
                               onChange={(e) => handleChange('pricing', 'full', parseFloat(e.target.value))}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Étudiant (€)</label>
                            <input 
                               type="number" step="0.10"
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none text-right font-mono text-lg"
                               value={settings.pricing.student}
                               onChange={(e) => handleChange('pricing', 'student', parseFloat(e.target.value))}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Enfant (-14 ans) (€)</label>
                            <input 
                               type="number" step="0.10"
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none text-right font-mono text-lg"
                               value={settings.pricing.child}
                               onChange={(e) => handleChange('pricing', 'child', parseFloat(e.target.value))}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Senior (+65 ans) (€)</label>
                            <input 
                               type="number" step="0.10"
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none text-right font-mono text-lg"
                               value={settings.pricing.senior}
                               onChange={(e) => handleChange('pricing', 'senior', parseFloat(e.target.value))}
                            />
                         </div>
                      </div>
                      
                      <div className="border-t border-gray-800 my-6"></div>
                      
                      <h3 className="text-lg font-bold text-white mb-4">Suppléments</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Supplément 3D (€)</label>
                            <input 
                               type="number" step="0.10"
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none text-right font-mono text-lg"
                               value={settings.pricing.surcharge_3d}
                               onChange={(e) => handleChange('pricing', 'surcharge_3d', parseFloat(e.target.value))}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Supplément IMAX/4DX (€)</label>
                            <input 
                               type="number" step="0.10"
                               className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none text-right font-mono text-lg"
                               value={settings.pricing.surcharge_imax}
                               onChange={(e) => handleChange('pricing', 'surcharge_imax', parseFloat(e.target.value))}
                            />
                         </div>
                      </div>
                   </div>
                )}

                {activeSection === 'receipt' && (
                   <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                         <Receipt className="w-6 h-6 text-red-500" /> Configuration Tickets
                      </h2>
                      <div>
                         <label className="block text-sm font-medium text-gray-400 mb-2">Entête du Ticket (Haut)</label>
                         <textarea 
                            rows="3"
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none font-mono"
                            value={settings.receipt.header}
                            onChange={(e) => handleChange('receipt', 'header', e.target.value)}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-400 mb-2">Pied de page (Bas)</label>
                         <textarea 
                            rows="3"
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none font-mono"
                            value={settings.receipt.footer}
                            onChange={(e) => handleChange('receipt', 'footer', e.target.value)}
                         />
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex items-center gap-4 mt-4">
                         <Printer className="w-8 h-8 text-gray-400" />
                         <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Imprimante Ticket IP</label>
                            <input 
                               className="w-full bg-transparent border-b border-gray-600 text-white focus:border-red-600 outline-none py-1 font-mono"
                               value={settings.receipt.printer_ip}
                               onChange={(e) => handleChange('receipt', 'printer_ip', e.target.value)}
                            />
                         </div>
                         <Button size="sm" variant="outline">Test Impression</Button>
                      </div>
                   </div>
                )}

                {activeSection === 'taxes' && (
                   <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                         <Database className="w-6 h-6 text-red-500" /> Fiscalité & Devise
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">TVA Billetterie (%)</label>
                            <div className="relative">
                               <input 
                                  type="number" step="0.1"
                                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none text-right font-mono"
                                  value={settings.taxes.vat_ticket}
                                  onChange={(e) => handleChange('taxes', 'vat_ticket', parseFloat(e.target.value))}
                               />
                               <span className="absolute right-10 top-3 text-gray-500">%</span>
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">TVA Confiserie (%)</label>
                            <div className="relative">
                               <input 
                                  type="number" step="0.1"
                                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 outline-none text-right font-mono"
                                  value={settings.taxes.vat_snack}
                                  onChange={(e) => handleChange('taxes', 'vat_snack', parseFloat(e.target.value))}
                               />
                               <span className="absolute right-10 top-3 text-gray-500">%</span>
                            </div>
                         </div>
                         <div className="col-span-2">
                             <div className="flex items-start gap-3 p-4 bg-blue-900/20 rounded-xl border border-blue-800/30">
                                <Lock className="w-5 h-5 text-blue-500 mt-1" />
                                <div>
                                   <h4 className="text-blue-400 font-bold text-sm">Conformité NF525</h4>
                                   <p className="text-gray-400 text-sm mt-1">Le système enregistre toutes les transactions de manière inaltérable conformément à la législation fiscale en vigueur. Les archives fiscales sont générées automatiquement chaque soir à 04:00.</p>
                                </div>
                             </div>
                         </div>
                      </div>
                   </div>
                )}

                {activeSection === 'system' && (
                   <div className="text-center py-12">
                      <Lock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-white mb-2">Zone Admin Système</h2>
                      <p className="text-gray-400 mb-6">Cette section nécessite des privilèges root.</p>
                      <Button variant="outline" className="border-red-900 text-red-500 hover:bg-red-900/20">Accéder aux logs système</Button>
                   </div>
                )}
             </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Settings;