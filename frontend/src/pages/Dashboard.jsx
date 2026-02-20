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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard');
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
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-100'
    },
    {
      title: 'Total Followers',
      value: (stats?.totalFollowers || 0).toLocaleString(),
      change: stats?.followersChange || '+23%',
      icon: FireIcon,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100'
    },
    {
      title: 'Avg Engagement',
      value: `${stats?.avgEngagement || 0}%`,
      change: stats?.engagementChange || '+5%',
      icon: ArrowTrendingUpIcon,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-100'
    },
    {
      title: 'Total Posts',
      value: (stats?.totalPosts || 0).toLocaleString(),
      change: stats?.postsChange || '+18%',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-100'
    }
  ];

  // Prepare chart data from real stats
  const followersLabels = stats?.followersGrowth?.map((_, i) => `Day ${i+1}`) || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const followersData = {
    labels: followersLabels,
    datasets: [
      {
        label: 'Followers Growth',
        data: stats?.followersGrowth || [12000, 19000, 15000, 25000, 22000, 30000, 38000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const engagementLabels = stats?.engagementHistory?.map((_, i) => `Day ${i+1}`) || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const engagementData = {
    labels: engagementLabels,
    datasets: [
      {
        label: 'Engagement Rate %',
        data: stats?.engagementHistory || [2.5, 3.0, 2.8, 3.2, 3.5, 4.0, 3.8],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const platformLabels = Object.keys(stats?.platformDistribution || { Instagram: 45, YouTube: 25, TikTok: 20, X: 10 });
  const platformData = {
    labels: platformLabels,
    datasets: [
      {
        data: Object.values(stats?.platformDistribution || { Instagram: 45, YouTube: 25, TikTok: 20, X: 10 }),
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <div className="flex space-x-2">
          {['day', 'week', 'month', 'year'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-sm font-medium rounded-lg capitalize transition-colors duration-200 ${
                timeframe === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${card.textColor} text-sm`}>{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className={`${card.textColor} text-sm mt-2 flex items-center`}>
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  {card.change}
                </p>
              </div>
              <card.icon className="h-12 w-12 opacity-50" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Followers Growth</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={followersData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Engagement Rate</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
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
                {(stats?.topCreators || [1,2,3].map(i => ({ name: `Creator ${i}`, username: `creator${i}`, followers: 150000*i, engagement: 3+i }))).map((creator, i) => (
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