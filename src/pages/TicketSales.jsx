import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SeatingPlan from '@/components/SeatingPlan';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Film, Clock, MapPin, ShoppingCart, ChevronLeft, Calendar, Armchair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TicketSales = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState('sessions'); // sessions, seats
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*, movies(title, poster_url, duration, rating, genre), rooms(name, capacity, seat_layout, type)')
        .gte('session_date', today)
        .eq('is_active', true)
        .order('session_time');

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les séances" });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setStep('seats');
    setSelectedSeats([]);
  };

  const handleSeatSelect = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  const handleAddToCart = () => {
    if (selectedSeats.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucun siège sélectionné",
        description: "Veuillez sélectionner au moins un siège pour continuer."
      });
      return;
    }

    const cartData = JSON.parse(localStorage.getItem('cart') || '{"tickets": [], "snacks": []}');
    
    // Create tickets from selected seats
    const newTickets = selectedSeats.map(seat => ({
      session_id: selectedSession.id,
      movie_title: selectedSession.movies.title,
      room_name: selectedSession.rooms.name,
      time: selectedSession.session_time,
      seat_number: seat,
      base_price: selectedSession.price_full, // Default to full price, adjusted in cart
      type: 'standard'
    }));

    cartData.tickets = [...cartData.tickets, ...newTickets];
    localStorage.setItem('cart', JSON.stringify(cartData));
    localStorage.setItem('selectedSession', JSON.stringify(selectedSession)); 
    
    toast({
      title: "Billets ajoutés !",
      description: `${newTickets.length} billets pour ${selectedSession.movies.title} ajoutés au panier.`
    });

    navigate('/cart');
  };

  return (
    <>
      <Helmet>
        <title>Billetterie - Ciné Gestion</title>
        <meta name="description" content="Vente de billets et plan de salle" />
      </Helmet>

      <Layout title={step === 'sessions' ? "Sélectionner Séance" : "Sélectionner Sièges"}>
        {step === 'seats' && (
          <div className="mb-6 flex items-center justify-between">
             <Button variant="ghost" onClick={() => setStep('sessions')} className="gap-2 text-gray-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" /> Retour aux séances
             </Button>
             <div className="text-right">
                <h3 className="text-white font-bold text-lg">{selectedSession?.movies.title}</h3>
                <p className="text-gray-400">{selectedSession?.session_time} • {selectedSession?.rooms.name}</p>
             </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'sessions' ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-6"
            >
              {loading ? (
                <div className="text-center text-gray-400 py-12">Chargement des séances...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSessionSelect(session)}
                      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-600 transition-all cursor-pointer group flex flex-row h-48"
                    >
                      <div className="w-32 bg-gray-800 relative flex-shrink-0">
                         <img alt={`Affiche pour ${session.movies.title}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://images.unsplash.com/photo-1534136302631-89abb23adf45" />
                         <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                            {session.movies.rating}
                         </div>
                      </div>
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-white font-bold text-xl mb-1 line-clamp-1">{session.movies.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <span>{session.movies.genre}</span>
                            <span>•</span>
                            <span>{session.movies.duration} min</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">
                               {session.version}
                             </span>
                             {session.is_3d && (
                               <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded border border-red-900/50">3D</span>
                             )}
                             {session.is_imax && (
                               <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-900/50">IMAX</span>
                             )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                           <div className="flex items-center gap-2 text-white font-medium">
                              <Clock className="w-4 h-4 text-red-500" />
                              {session.session_time.substring(0,5)}
                           </div>
                           <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Armchair className="w-4 h-4" />
                              {session.available_seats} places
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 overflow-auto pb-24">
                <SeatingPlan 
                  room={selectedSession?.rooms} 
                  occupiedSeats={selectedSession?.occupied_seats || []}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                />
              </div>

              {/* Bottom Action Bar */}
              <div className="fixed bottom-0 left-0 lg:left-70 right-0 bg-gray-900 border-t border-gray-800 p-4 md:p-6 z-10 flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-gray-400 text-sm">Sièges sélectionnés</span>
                     <span className="text-white font-bold text-xl">
                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Aucun'}
                     </span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-right hidden md:block">
                        <span className="text-gray-400 text-sm block">Total estimé</span>
                        <span className="text-white font-bold text-2xl">
                           {(selectedSeats.length * (selectedSession?.price_full || 0)).toFixed(2)} €
                        </span>
                     </div>
                     <Button 
                        size="lg" 
                        onClick={handleAddToCart}
                        disabled={selectedSeats.length === 0}
                        className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/20"
                     >
                        Ajouter au panier
                     </Button>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </>
  );
};

export default TicketSales;