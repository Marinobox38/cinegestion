import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Film, Delete, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { user, signInWithPin } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) return;

    setLoading(true);
    const { error } = await signInWithPin(pin);
    if (!error) {
      navigate('/');
    } else {
      setPin(''); // Reset on failure
    }
    setLoading(false);
  };

  // Auto submit when 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <>
      <Helmet>
        <title>Connexion - Ciné Gestion</title>
        <meta name="description" content="Connexion Système POS Cinéma" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Side: Branding */}
          <div className="md:w-1/2 p-12 bg-gradient-to-br from-red-900/20 to-gray-900 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-800">
            <div className="bg-red-600 p-6 rounded-full mb-8 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <Film className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Ciné Gestion</h1>
            <p className="text-gray-400 text-lg">Système de Point de Vente</p>
            <div className="mt-12 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
               <p className="text-sm text-gray-400">Pour le support technique, contactez le</p>
               <p className="text-white font-mono mt-1">01 23 45 67 89</p>
            </div>
          </div>

          {/* Right Side: Keypad */}
          <div className="md:w-1/2 p-8 md:p-12 bg-gray-900">
            <div className="max-w-xs mx-auto">
              <h2 className="text-2xl font-bold text-white text-center mb-8">Entrez votre code PIN</h2>
              
              {/* PIN Display */}
              <div className="flex justify-center gap-4 mb-10">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`w-6 h-6 rounded-full transition-all duration-200 ${
                      i < pin.length 
                        ? 'bg-red-600 scale-110 shadow-[0_0_10px_rgba(220,38,38,0.5)]' 
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {numbers.map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleNumberClick(num.toString())}
                    disabled={loading}
                    className="h-20 w-full text-2xl font-bold rounded-2xl bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-all active:scale-95"
                  >
                    {num}
                  </Button>
                ))}
                <div className="col-span-1"></div> {/* Spacer */}
                <Button
                  onClick={() => handleNumberClick('0')}
                  disabled={loading}
                  className="h-20 w-full text-2xl font-bold rounded-2xl bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-all active:scale-95"
                >
                  0
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={loading || pin.length === 0}
                  className="h-20 w-full rounded-2xl bg-gray-800/50 hover:bg-red-900/30 text-red-500 border border-gray-700 hover:border-red-900/50 transition-all active:scale-95"
                >
                  <Delete className="w-8 h-8" />
                </Button>
              </div>

              <div className="text-center">
                 {loading && <p className="text-gray-400 animate-pulse">Connexion en cours...</p>}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;