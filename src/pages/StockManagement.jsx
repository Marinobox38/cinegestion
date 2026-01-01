import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Package, AlertTriangle, Plus, Search, Filter } from 'lucide-react';

const StockManagement = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');

  const stockItems = [
    { id: 1, name: 'Popcorn (Grand)', category: 'Nourriture', qty: 15, alert: 20, expiry: '2026-02-15', status: 'low' },
    { id: 2, name: 'Coca Cola 500ml', category: 'Boisson', qty: 142, alert: 50, expiry: '2026-06-01', status: 'ok' },
    { id: 3, name: 'M&Ms Peanut', category: 'Confiserie', qty: 8, alert: 15, expiry: '2026-01-20', status: 'low' },
    { id: 4, name: 'Plateau Nachos', category: 'Nourriture', qty: 45, alert: 20, expiry: '2026-03-10', status: 'ok' },
  ];

  return (
    <>
      <Helmet>
        <title>Gestion des Stocks - Ciné Gestion</title>
      </Helmet>

      <Layout title="Stocks & Inventaire">
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800 w-full md:w-auto">
                 <Button 
                    variant={filter === 'all' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setFilter('all')}
                  >Tout</Button>
                 <Button 
                    variant={filter === 'low' ? 'destructive' : 'ghost'} 
                    size="sm" 
                    onClick={() => setFilter('low')}
                    className={filter === 'low' ? '' : 'text-red-400'}
                  >Stock Faible</Button>
                 <Button 
                    variant={filter === 'expiry' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setFilter('expiry')}
                    className={filter === 'expiry' ? 'bg-yellow-600' : 'text-yellow-400'}
                  >Expiration Proche</Button>
              </div>
              <div className="flex gap-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input className="bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-red-600" placeholder="Chercher articles..." />
                 </div>
                 <Button className="bg-red-600 hover:bg-red-700 gap-2">
                    <Plus className="w-4 h-4" /> Commander
                 </Button>
              </div>
           </div>

           <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-800 text-gray-400">
                    <tr>
                       <th className="p-4 font-medium">Nom de l'article</th>
                       <th className="p-4 font-medium">Catégorie</th>
                       <th className="p-4 font-medium">Quantité</th>
                       <th className="p-4 font-medium">Date d'expiration</th>
                       <th className="p-4 font-medium">Statut</th>
                       <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                    {stockItems.map(item => (
                       <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="p-4 font-bold text-white">{item.name}</td>
                          <td className="p-4 text-gray-400">{item.category}</td>
                          <td className="p-4">
                             <span className={`font-bold ${item.qty < item.alert ? 'text-red-500' : 'text-white'}`}>
                                {item.qty} unités
                             </span>
                          </td>
                          <td className="p-4 text-gray-300">{item.expiry}</td>
                          <td className="p-4">
                             {item.status === 'low' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-900/30 text-red-400 text-xs border border-red-900/50">
                                   <AlertTriangle className="w-3 h-3" /> Stock Faible
                                </span>
                             )}
                             {item.status === 'ok' && (
                                <span className="inline-flex items-center px-2 py-1 rounded bg-green-900/30 text-green-400 text-xs border border-green-900/50">
                                   OK
                                </span>
                             )}
                          </td>
                          <td className="p-4 text-right">
                             <Button size="sm" variant="outline" className="h-8 text-xs border-gray-700">Réassort</Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </Layout>
    </>
  );
};

export default StockManagement;