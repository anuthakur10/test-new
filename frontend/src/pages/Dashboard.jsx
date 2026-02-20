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
  Bar,
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('week');

  const fetchStats = async () => {
    try {
      const res = await api.get(`/analytics/dashboard?timeframe=${timeframe}`);
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

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
        <div className="flex">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Creators',
      value: stats?.totalCreators || 0,
      change: stats?.creatorsChange || '+12%',
      icon: UserGroupIcon,
      color: 'bg-white',
      textColor: 'text-gray-600',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Total Followers',
      value: (stats?.totalFollowers || 0).toLocaleString(),
      change: stats?.followersChange || '+23%',
      icon: FireIcon,
      color: 'bg-white',
      textColor: 'text-gray-600',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100'
    },
    {
      title: 'Avg Engagement',
      value: `${stats?.avgEngagement || 0}%`,
      change: stats?.engagementChange || '+5%',
      icon: ArrowTrendingUpIcon,
      color: 'bg-white',
      textColor: 'text-gray-600',
      iconColor: 'text-green-600',
      borderColor: 'border-green-100'
    },
    {
      title: 'Total Posts',
      value: (stats?.totalPosts || 0).toLocaleString(),
      change: stats?.postsChange || '+18%',
      icon: ChartBarIcon,
      color: 'bg-white',
      textColor: 'text-gray-600',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-100'
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.03)',
          drawTicks: false
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          padding: 10
        }
      },
      x: {
        border: { display: false },
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          padding: 10
        }
      }
    }
  };

  const followersLabels = stats?.followersGrowth?.map((_, i) => timeframe === 'day' ? `${i}:00` : `Day ${i+1}`) || [];
  const followersData = {
    labels: followersLabels,
    datasets: [
      {
        label: 'Followers Growth',
        data: stats?.followersGrowth || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const engagementLabels = stats?.engagementHistory?.map((_, i) => timeframe === 'day' ? `${i}:00` : `Day ${i+1}`) || [];
  const engagementData = {
    labels: engagementLabels,
    datasets: [
      {
        label: 'Engagement Rate %',
        data: stats?.engagementHistory || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const platformLabels = Object.keys(stats?.platformDistribution || {});
  const platformData = {
    labels: platformLabels,
    datasets: [
      {
        data: Object.values(stats?.platformDistribution || {}),
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your creators.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          {['day', 'week', 'month', 'year'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg capitalize transition-all duration-200 ${
                timeframe === t
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-2xl border ${card.borderColor} shadow-sm p-6 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${card.iconColor} bg-opacity-10 bg-current`}>
                <card.icon className="h-6 w-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-700`}>
                {card.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Followers Growth</h3>
          </div>
          <div className="h-64">
            <Line data={followersData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Engagement Rate</h3>
          </div>
          <div className="h-64">
            <Line data={engagementData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
              <div className="h-48">
                <Doughnut 
                  data={platformData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Creators</h3>
              <div className="space-y-3">
                {(stats?.topCreators || []).map((creator, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {creator.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{creator.name}</p>
                        <p className="text-sm text-gray-500">@{creator.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{creator.followers.toLocaleString()} followers</p>
                      <p className="text-sm text-green-600">+{creator.engagement}% engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
