import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import {
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  Bar,
  Doughnut,
} from 'react-chartjs-2';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const { add } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, cRes, sRes] = await Promise.all([
        api.get('/users'),
        api.get('/creators'),
        api.get('/analytics/dashboard')
      ]);
      setUsers(uRes.data.users || []);
      setCreators(cRes.data.creators || []);
      setStats(sRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading admin data');
      add('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleDisable = async (id, currentStatus) => {
    try {
      const res = await api.patch(`/users/${id}/disable`, { disabled: !currentStatus });
      setUsers(prev => prev.map(u =>
        u._id === id ? { ...u, disabled: res.data.user.disabled } : u
      ));
      add(res.data.user.disabled ? 'User disabled' : 'User enabled', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating user';
      add(msg, 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

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
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const platformDistributionData = stats?.platformDistribution || {};
  
  const platformDistribution = {
    labels: Object.keys(platformDistributionData),
    datasets: [
      {
        data: Object.values(platformDistributionData),
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

  const userActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: stats?.userActivity || [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            Admin Panel
            <ShieldCheckIcon className="h-8 w-8 text-purple-600 ml-3" />
          </h1>
          <p className="text-gray-500 mt-1">Global platform oversight and user management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 transform transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <UsersIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Users</span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
            <p className="text-xs text-gray-400 mt-1">{users.filter(u => u.role === 'admin').length} Admins</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 transform transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Creators</span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Total Creators</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{creators.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 transform transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Reach</span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Total Followers</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{(stats?.totalFollowers || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 transform transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Engage</span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Avg Engagement</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.avgEngagement || 0}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={platformDistribution}
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

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="h-64">
            <Bar
              data={userActivityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">User Management</h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50"
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50/50"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Creators</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">{user.creatorCount || 0}</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    {user.disabled ? (
                      <span className="flex items-center text-red-600 text-xs font-bold uppercase tracking-wider">
                        <XCircleIcon className="h-4 w-4 mr-1.5" /> Inactive
                      </span>
                    ) : (
                      <span className="flex items-center text-green-600 text-xs font-bold uppercase tracking-wider">
                        <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <button
                      onClick={() => toggleDisable(user._id, user.disabled)}
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                        user.disabled
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {user.disabled ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
