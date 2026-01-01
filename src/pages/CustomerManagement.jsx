import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Users, Plus } from 'lucide-react';

const CustomerManagement = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Cette feature arrive bientôt",
      description: "🚧 Cette fonctionnalité sera bientôt activée !",
    });
  };

  return (
    <>
      <Helmet>
        <title>Customer Management - Cinema POS</title>
        <meta name="description" content="Manage customers" />
      </Helmet>

      <Layout title="Customer Management">
        <div className="mb-6">
          <Button onClick={handleAction} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-5 h-5 mr-2" />
            Add Customer
          </Button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Customer management interface coming soon</p>
        </div>
      </Layout>
    </>
  );
};

export default CustomerManagement;