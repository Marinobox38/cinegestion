import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const SnackSales = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [snacks, setSnacks] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSnacks();
    loadCart();
  }, []);

  const fetchSnacks = async () => {
    try {
      const { data, error } = await supabase
        .from('snacks')
        .select('*')
        .eq('is_active', true)
        .order('category, name');

      if (error) throw error;
      setSnacks(data || []);
    } catch (error) {
      console.error('Error fetching snacks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load snacks",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '{"tickets": [], "snacks": []}');
    setCart(cartData.snacks || []);
  };

  const addToCart = (snack) => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '{"tickets": [], "snacks": []}');
    const existingItem = cartData.snacks.find(item => item.id === snack.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartData.snacks.push({ ...snack, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cartData));
    setCart(cartData.snacks);

    toast({
      title: "Added to cart",
      description: `${snack.name} added to cart`,
    });
  };

  const updateQuantity = (snackId, change) => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '{"tickets": [], "snacks": []}');
    const item = cartData.snacks.find(item => item.id === snackId);

    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        cartData.snacks = cartData.snacks.filter(item => item.id !== snackId);
      }
    }

    localStorage.setItem('cart', JSON.stringify(cartData));
    setCart(cartData.snacks);
  };

  const categories = [...new Set(snacks.map(s => s.category))];

  const getCategoryColor = (category) => {
    const colors = {
      popcorn: 'bg-yellow-600',
      drinks: 'bg-blue-600',
      candy: 'bg-pink-600',
      combo: 'bg-green-600',
      other: 'bg-gray-600',
    };
    return colors[category] || 'bg-gray-600';
  };

  return (
    <>
      <Helmet>
        <title>Snack Sales - Cinema POS</title>
        <meta name="description" content="Sell cinema snacks and drinks" />
      </Helmet>

      <Layout title="Snack Sales">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading snacks...</div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-white text-2xl font-bold mb-4 capitalize">{category}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {snacks
                    .filter((snack) => snack.category === category)
                    .map((snack, index) => {
                      const inCart = cart.find(item => item.id === snack.id);
                      return (
                        <motion.div
                          key={snack.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-600 transition-all"
                        >
                          <div className="aspect-square bg-gray-800 relative">
                            <img alt={snack.name} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1666808925794-7ed317288326" />
                            {snack.stock_quantity < snack.stock_alert_level && (
                              <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                                Low Stock
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="text-white font-bold mb-1">{snack.name}</h3>
                            <p className="text-gray-400 text-sm mb-2 capitalize">{snack.size}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-white text-xl font-bold">${snack.price.toFixed(2)}</span>
                              {inCart ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateQuantity(snack.id, -1)}
                                    className="h-8 w-8 p-0 bg-gray-700 hover:bg-gray-600"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="text-white font-bold w-8 text-center">{inCart.quantity}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => updateQuantity(snack.id, 1)}
                                    className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(snack)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Button */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6"
          >
            <Button
              onClick={() => navigate('/cart')}
              size="lg"
              className="h-16 px-6 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl flex items-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
            </Button>
          </motion.div>
        )}
      </Layout>
    </>
  );
};

export default SnackSales;