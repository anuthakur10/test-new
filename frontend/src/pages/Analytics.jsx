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
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        border: { display: false },
        grid: { color: 'rgba(0,0,0,0.03)', drawTicks: false },
        ticks: { color: '#9ca3af', font: { size: 11 } }
      },
      x: { 
        border: { display: false },
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } }
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Analytics Overview
        </h1>
        <p className="text-gray-500 mt-1">Deep dive into your creator performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80 font-medium">{card.title}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
                <div className="mt-4 flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 w-fit">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs font-bold">{card.change}</span>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl">
                <card.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Followers Growth</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Live</span>
          </div>
          <div className="h-72">
            <Line data={followersData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Engagement Rate</h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">Active</span>
          </div>
          <div className="h-72">
            <Line data={engagementData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all hover:shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-8">Platform Distribution</h3>
        <div className="h-80 max-w-lg mx-auto">
          <Doughnut 
            data={platformData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false, 
              plugins: { 
                legend: { 
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    padding: 25,
                    font: { size: 13, weight: 'bold' }
                  }
                } 
              },
              cutout: '70%'
            }} 
          />
        </div>
      </div>
    </div>
  );
}