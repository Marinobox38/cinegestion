import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Plus } from 'lucide-react';

const SessionManagement = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Cette feature arrive !",
      description: "🚧 Cette fonctionnalité sera bientôt ajoutée !",
    });
  };

  return (
    <>
      <Helmet>
        <title>Session Management - Cinema POS</title>
        <meta name="description" content="Manage cinema sessions" />
      </Helmet>

      <Layout title="Session Management">
        <div className="mb-6">
          <Button onClick={handleAction} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-5 h-5 mr-2" />
            Add Session
          </Button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Session management interface coming soon</p>
        </div>
      </Layout>
    </>
  );
};

export default SessionManagement;