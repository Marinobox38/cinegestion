import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Film, Plus, Edit, Trash2 } from 'lucide-react';

const MovieManagement = () => {
  const { toast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = () => {
    toast({
      title: "Cette feature arrive",
      description: "🚧 Cette fonctionnalité sera bientôt disponible !",
    });
  };

  return (
    <>
      <Helmet>
        <title>Movie Management - Cinema POS</title>
        <meta name="description" content="Manage cinema movies" />
      </Helmet>

      <Layout title="Movie Management">
        <div className="mb-6">
          <Button onClick={handleAddMovie} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-5 h-5 mr-2" />
            Add Movie
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No movies found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="aspect-[2/3] bg-gray-800">
                  <img alt={movie.title} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1548912803-8355e980322d" />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2">{movie.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{movie.duration} min • {movie.rating}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  );
};

export default MovieManagement;