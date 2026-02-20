import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import {
  ArrowPathIcon,
  ChartBarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CreatorDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/analytics/creator/${id}`);
      // The response contains { analytics: { ... } }
      setData(res.data.analytics);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const res = await api.post(`/analytics/refresh/${id}`);
      setData(res.data.analytics);
    } catch (err) {
      setError(err.response?.data?.message || 'Error refreshing analytics');
    } finally {
      setRefreshing(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-gray-300 to-gray-400"></div>
          <div className="pt-20 px-8 pb-8">
            <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-xl"></div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
        <div>
          <p className="text-sm text-red-700 font-medium">Error</p>
          <p className="text-sm text-red-600">{error || 'Creator not found'}</p>
          <Link to="/creators" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            ← Back to creators
          </Link>
        </div>
      </div>
    );
  }

  const historicalData = data.historical || [];
  const hasHistorical = historicalData.length > 0;

  // Prepare chart data
  const followersData = hasHistorical ? {
    labels: historicalData.map(h => new Date(h.date).toLocaleDateString()),
    datasets: [{
      label: 'Followers',
      data: historicalData.map(h => h.followers),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  } : null;

  const engagementData = hasHistorical ? {
    labels: historicalData.map(h => new Date(h.date).toLocaleDateString()),
    datasets: [{
      label: 'Engagement Rate %',
      data: historicalData.map(h => h.engagementRate),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1f2937' }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const statsCards = [
    {
      label: 'Total Followers',
      value: (data.followers || 0).toLocaleString(),
      icon: UserGroupIcon,
      color: 'from-blue-500 to-blue-600',
      change: '+12.5%' // This could be dynamic if backend provides it
    },
    {
      label: 'Engagement Rate',
      value: `${data.engagementRate || 0}%`,
      icon: ChartBarIcon,
      color: 'from-green-500 to-green-600',
      change: '+2.3%'
    },
    {
      label: 'Avg Likes',
      value: (data.avgLikes || 0).toLocaleString(),
      icon: HeartIcon,
      color: 'from-pink-500 to-pink-600',
      change: '+5.7%'
    },
    {
      label: 'Avg Comments',
      value: (data.avgComments || 0).toLocaleString(),
      icon: ChatBubbleLeftIcon,
      color: 'from-purple-500 to-purple-600',
      change: '+8.1%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/creators"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Creator Analytics
        </h1>
      </div>

      {/* Creator Profile */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="absolute -bottom-16 left-4 sm:left-8">
            <img
              src={data.creator?.profileImageUrl || 'https://via.placeholder.com/150'}
              alt={data.creator?.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-white object-cover shadow-xl"
            />
          </div>
        </div>

        <div className="pt-20 px-4 sm:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{data.creator?.name}</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                {data.creator?.platform} • @{data.creator?.username}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">Last updated: {new Date(data.lastUpdated).toLocaleString()}</span>
              </div>
              <button
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg text-sm"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Analytics'}
              </button>
            </div>
          </div>
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
                <p className="text-xs sm:text-sm opacity-90">{card.label}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-xs sm:text-sm opacity-90 mt-2 flex items-center">
                  <span className="text-green-300 mr-1">↑</span>
                  {card.change}
                </p>
              </div>
              <card.icon className="h-8 w-8 sm:h-12 sm:w-12 opacity-50" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {hasHistorical ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Followers Growth</h3>
            <div className="h-64 sm:h-80">
              <Line data={followersData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Engagement Rate</h3>
            <div className="h-64 sm:h-80">
              <Line data={engagementData} options={chartOptions} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No historical data yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analytics will appear here after the first refresh.
          </p>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Generate Analytics'}
          </button>
        </div>
      )}

      {/* Historical Data Table */}
      {hasHistorical && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Historical Data</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalData.slice().reverse().map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {item.followers.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {item.engagementRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}