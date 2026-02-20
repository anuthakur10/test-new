import { useEffect, useState } from 'react';
import api from '../api';
import {
  ChartBarIcon,
  UserGroupIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import {
  Line,
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Creators',
      value: stats?.totalCreators || 0,
      change: stats?.creatorsChange || '+12%',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Followers',
      value: (stats?.totalFollowers || 0).toLocaleString(),
      change: stats?.followersChange || '+23%',
      icon: FireIcon,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Avg Engagement',
      value: `${stats?.avgEngagement || 0}%`,
      change: stats?.engagementChange || '+5%',
      icon: ArrowTrendingUpIcon,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Posts',
      value: (stats?.totalPosts || 0).toLocaleString(),
      change: stats?.postsChange || '+18%',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-orange-600',
    }
  ];

  const followersData = {
    labels: stats?.followersGrowth?.map((_, i) => `Day ${i+1}`) || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Followers Growth',
      data: stats?.followersGrowth || [12000, 19000, 15000, 25000, 22000, 30000, 38000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const engagementData = {
    labels: stats?.engagementHistory?.map((_, i) => `Day ${i+1}`) || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Engagement Rate %',
      data: stats?.engagementHistory || [2.5, 3.0, 2.8, 3.2, 3.5, 4.0, 3.8],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const platformData = {
    labels: Object.keys(stats?.platformDistribution || { Instagram: 45, YouTube: 25, TikTok: 20, X: 10 }),
    datasets: [{
      data: Object.values(stats?.platformDistribution || { Instagram: 45, YouTube: 25, TikTok: 20, X: 10 }),
      backgroundColor: ['rgba(236,72,153,0.8)', 'rgba(239,68,68,0.8)', 'rgba(34,197,94,0.8)', 'rgba(59,130,246,0.8)'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Analytics Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-sm opacity-90 mt-2 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  {card.change}
                </p>
              </div>
              <card.icon className="h-12 w-12 opacity-50" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Followers Growth</h3>
          <div className="h-64">
            <Line data={followersData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Engagement Rate</h3>
          <div className="h-64">
            <Line data={engagementData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
        <div className="h-64 max-w-md mx-auto">
          <Doughnut data={platformData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
    </div>
  );
}