import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem('cinema_pos_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser({ id: parsed.id, email: parsed.email });
        setUserProfile(parsed);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const signInWithPin = async (pin) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('pin_code', pin)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Échec de connexion",
          description: "Code PIN invalide ou utilisateur inactif.",
        });
        return { error: error || new Error('Invalid PIN') };
      }

      // Simulate session
      const mockUser = { id: data.id, email: data.email };
      
      setUser(mockUser);
      setUserProfile(data);
      localStorage.setItem('cinema_pos_user', JSON.stringify(data));

      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${data.full_name}`,
      });

      return { error: null };
    } catch (err) {
      console.error(err);
      return { error: err };
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('cinema_pos_user');
    
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès.",
    });

    return { error: null };
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithPin,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};