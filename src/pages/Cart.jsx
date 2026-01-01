import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Trash2, CreditCard, Banknote, Smartphone, Ticket, Plus, Minus, User, Gift, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const [cart, setCart] = useState({ tickets: [], snacks: [] });
  const [customer, setCustomer] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([{ type: 'cash', amount: 0 }]);
  const [processing, setProcessing] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '{"tickets": [], "snacks": []}');
    setCart(cartData);
    
    // Initialize first payment method with total
    const total = calculateTotal(cartData);
    setPaymentMethods([{ type: 'cash', amount: total }]);
  };

  const calculateTotal = (currentCart = cart) => {
    const snacksTotal = currentCart.snacks?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const ticketsTotal = currentCart.tickets?.reduce((sum, item) => sum + (item.base_price || 0), 0) || 0;
    return snacksTotal + ticketsTotal;
  };

  const handleSearchCustomer = async () => {
    if (!customerSearch) return;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`email.ilike.%${customerSearch}%,phone.ilike.%${customerSearch}%,card_number.eq.${customerSearch}`)
      .single();

    if (data) {
       setCustomer(data);
       toast({ title: "Client trouvé", description: `Lié : ${data.full_name}` });
    } else {
       toast({ variant: "destructive", title: "Non trouvé", description: "Aucun client trouvé." });
    }
  };

  const updateTicketPriceType = (index, type, price) => {
     const newCart = { ...cart };
     newCart.tickets[index].type = type;
     newCart.tickets[index].base_price = price; 
     setCart(newCart);
     localStorage.setItem('cart', JSON.stringify(newCart));
     
     // Reset payment distribution
     setPaymentMethods([{ type: 'cash', amount: calculateTotal(newCart) }]);
  };

  const handleCheckout = async () => {
    const total = calculateTotal();
    const paidAmount = paymentMethods.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    if (Math.abs(paidAmount - total) > 0.01) {
       toast({ 
          variant: "destructive", 
          title: "Erreur de montant", 
          description: `Le total est ${total.toFixed(2)} € mais le paiement saisi est ${paidAmount.toFixed(2)} €` 
       });
       return;
    }

    setProcessing(true);
    try {
      const orderNumber = `CMD-${Date.now()}`;
      
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          cashier_id: userProfile?.id,
          customer_id: customer?.id,
          total_amount: total,
          status: 'completed',
          split_payment_details: paymentMethods,
          payment_method: paymentMethods.length > 1 ? 'mixed' : paymentMethods[0].type
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Snacks
      if (cart.snacks.length > 0) {
        const orderItems = cart.snacks.map(snack => ({
          order_id: order.id,
          snack_id: snack.id,
          quantity: snack.quantity,
          unit_price: snack.price,
          total_price: snack.price * snack.quantity,
        }));
        await supabase.from('order_items').insert(orderItems);
        
        // Update Stock
        for (const snack of cart.snacks) {
           await supabase.rpc('decrement_stock', { snack_id: snack.id, quantity: snack.quantity })
              .catch(() => supabase.from('snacks').update({ stock_quantity: snack.stock_quantity - snack.quantity }).eq('id', snack.id));
        }
      }

      // 3. Insert Tickets
      if (cart.tickets.length > 0) {
         const ticketsData = cart.tickets.map(ticket => ({
            order_id: order.id,
            session_id: ticket.session_id,
            ticket_type: ticket.type,
            seat_number: ticket.seat_number,
            price: ticket.base_price,
            qr_code: `${orderNumber}-${ticket.seat_number}-${Date.now()}`,
            is_used: false
         }));
         await supabase.from('tickets').insert(ticketsData);
      }

      // 4. Update Loyalty
      if (customer) {
         const pointsEarned = Math.floor(total); // 1 point per euro
         await supabase.from('customers')
            .update({ points_balance: (customer.points_balance || 0) + pointsEarned })
            .eq('id', customer.id);
      }

      localStorage.removeItem('cart');
      toast({ title: "Commande terminée !", description: `Reçu #${orderNumber} généré.` });
      navigate('/');
      
    } catch (error) {
       console.error(error);
       toast({ variant: "destructive", title: "Erreur", description: "La transaction a échoué." });
    } finally {
       setProcessing(false);
    }
  };

  const total = calculateTotal();
  
  return (
    <>
      <Helmet>
        <title>Paiement - Ciné Gestion</title>
      </Helmet>
      <Layout title="Paiement">
        <div className="grid lg:grid-cols-3 gap-6 h-full">
          {/* Left: Items List */}
          <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
             
             {/* Customer Lookup */}
             <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4 items-center">
                <div className="bg-gray-800 p-2 rounded-full"><User className="w-5 h-5 text-gray-400" /></div>
                {customer ? (
                   <div className="flex-1 flex justify-between items-center">
                      <div>
                         <p className="font-bold text-white">{customer.full_name}</p>
                         <p className="text-sm text-green-500">{customer.points_balance || 0} pts • {customer.subscription_plan || 'Pas d\'abonnement'}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setCustomer(null)}><Trash2 className="w-4 h-4" /></Button>
                   </div>
                ) : (
                   <div className="flex-1 flex gap-2">
                      <input 
                         className="bg-transparent border-none text-white focus:outline-none flex-1 placeholder-gray-600"
                         placeholder="Scanner carte ou chercher tél/email..."
                         value={customerSearch}
                         onChange={(e) => setCustomerSearch(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                      />
                      <Button size="sm" variant="secondary" onClick={handleSearchCustomer}>Chercher</Button>
                   </div>
                )}
             </div>

             {/* Tickets Section */}
             {cart.tickets?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                   <h3 className="text-gray-400 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                      <Ticket className="w-4 h-4" /> Billets
                   </h3>
                   {cart.tickets.map((ticket, idx) => (
                      <div key={idx} className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800 last:border-0 last:pb-0 last:mb-0">
                         <div>
                            <p className="font-bold text-white">{ticket.movie_title}</p>
                            <p className="text-sm text-gray-400">Siège {ticket.seat_number} • {ticket.time?.substring(0,5)}</p>
                         </div>
                         <div className="flex items-center gap-4">
                            <select 
                               className="bg-gray-800 border-none text-white text-sm rounded p-2 focus:ring-1 focus:ring-red-600"
                               value={ticket.type}
                               onChange={(e) => {
                                  // Mock price change logic
                                  const prices = { standard: 12, student: 10, child: 8, senior: 9 };
                                  updateTicketPriceType(idx, e.target.value, prices[e.target.value]);
                               }}
                            >
                               <option value="standard">Standard (12 €)</option>
                               <option value="student">Étudiant (10 €)</option>
                               <option value="child">Enfant (8 €)</option>
                               <option value="senior">Senior (9 €)</option>
                            </select>
                            <p className="font-bold w-16 text-right">{ticket.base_price.toFixed(2)} €</p>
                            <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-500" onClick={() => {
                               const newCart = {...cart};
                               newCart.tickets.splice(idx, 1);
                               setCart(newCart);
                               localStorage.setItem('cart', JSON.stringify(newCart));
                            }}><Trash2 className="w-4 h-4" /></Button>
                         </div>
                      </div>
                   ))}
                </div>
             )}

             {/* Snacks Section */}
             {cart.snacks?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                   <h3 className="text-gray-400 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Confiserie
                   </h3>
                   {cart.snacks.map((snack, idx) => (
                      <div key={idx} className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-800 rounded overflow-hidden">
                               <img alt={snack.name} src={snack.image_url || "https://images.unsplash.com/photo-1574941926639-661858c73653"} className="w-full h-full object-cover"/>
                            </div>
                            <span className="text-white">{snack.name}</span>
                         </div>
                         <div className="flex items-center gap-4">
                             <span className="text-gray-400">x{snack.quantity}</span>
                             <span className="font-bold text-white">{(snack.price * snack.quantity).toFixed(2)} €</span>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

          {/* Right: Payment */}
          <div className="lg:col-span-1">
             <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-6">
                <div className="flex justify-between items-end mb-6">
                   <div>
                      <p className="text-gray-400 text-sm">Total à payer</p>
                      <h2 className="text-4xl font-bold text-white">{total.toFixed(2)} €</h2>
                   </div>
                   <div className="text-right">
                      <p className="text-gray-400 text-xs">Articles : {cart.tickets?.length + cart.snacks?.length}</p>
                   </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 mb-6">
                   <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Moyens de paiement</p>
                   <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="h-12 border-gray-700 hover:bg-gray-800 justify-start gap-2"
                         onClick={() => setPaymentMethods([{type: 'cash', amount: total}])}>
                         <Banknote className="w-4 h-4 text-green-500" /> Espèces
                      </Button>
                      <Button variant="outline" className="h-12 border-gray-700 hover:bg-gray-800 justify-start gap-2"
                         onClick={() => setPaymentMethods([{type: 'card', amount: total}])}>
                         <CreditCard className="w-4 h-4 text-blue-500" /> Carte
                      </Button>
                      <Button variant="outline" className="h-12 border-gray-700 hover:bg-gray-800 justify-start gap-2"
                         onClick={() => setPaymentMethods([{type: 'mobile', amount: total}])}>
                         <Smartphone className="w-4 h-4 text-purple-500" /> Mobile
                      </Button>
                      <Button variant="outline" className="h-12 border-gray-700 hover:bg-gray-800 justify-start gap-2"
                         onClick={() => setPaymentMethods([{type: 'voucher', amount: total}])}>
                         <Gift className="w-4 h-4 text-yellow-500" /> Chèque
                      </Button>
                   </div>
                </div>

                {/* Split Payment Logic (Simplified for Demo) */}
                <div className="bg-gray-800/50 rounded-lg p-3 mb-6">
                   <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Payé :</span>
                      <span className="text-white">{paymentMethods.reduce((a,b) => a + Number(b.amount), 0).toFixed(2)} €</span>
                   </div>
                   <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-400">Restant :</span>
                      <span className={total - paymentMethods.reduce((a,b) => a + Number(b.amount), 0) === 0 ? "text-green-500" : "text-red-500"}>
                         {Math.abs(total - paymentMethods.reduce((a,b) => a + Number(b.amount), 0)).toFixed(2)} €
                      </span>
                   </div>
                </div>

                <Button 
                   className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20"
                   onClick={handleCheckout}
                   disabled={processing}
                >
                   {processing ? 'Traitement...' : 'Valider le paiement'}
                </Button>
             </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Cart;