import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { TrendingUp } from 'lucide-react';

const Statistics = () => {
  return (
    <>
      <Helmet>
        <title>Statistics - Cinema POS</title>
        <meta name="description" content="Sales statistics and analytics" />
      </Helmet>

      <Layout title="Statistics">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Statistics dashboard coming soon</p>
        </div>
      </Layout>
    </>
  );
};

export default Statistics;