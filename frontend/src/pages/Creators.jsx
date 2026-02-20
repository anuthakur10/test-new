import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PhotoIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function Creators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    platform: 'Instagram',
    username: '',
    profileImageUrl: ''
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const { add } = useToast();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const res = await api.get('/creators');
      setCreators(res.data.creators || []);
    } catch (err) {
      add('Failed to load creators', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.username.trim()) return 'Username is required';
    return null;
  };

  const handleEdit = (creator) => {
    setEditingId(creator._id);
    setForm({
      name: creator.name,
      platform: creator.platform,
      username: creator.username,
      profileImageUrl: creator.profileImageUrl || ''
    });
    setShowForm(true);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setError('');
    setSubmitting(true);

    try {
      if (editingId) {
        const res = await api.put(`/creators/${editingId}`, form);
        setCreators(prev => prev.map(c => c._id === editingId ? res.data.creator : c));
        add('Creator updated successfully', 'success');
      } else {
        const res = await api.post('/creators', form);
        setCreators(prev => [res.data.creator, ...prev]);
        add('Creator created successfully', 'success');
      }
      // Reset form and close
      setForm({ name: '', platform: 'Instagram', username: '', profileImageUrl: '' });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving creator';
      setError(msg);
      add(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm(f => ({ ...f, profileImageUrl: event.target.result }));
    };
    reader.readAsDataURL(file);

    // Upload to S3
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);

    try {
      const res = await api.post('/upload/creator-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, profileImageUrl: res.data.url }));
      add('Image uploaded successfully', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload error';
      setError(msg);
      add(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const deleteCreator = async (id) => {
    if (!window.confirm('Are you sure you want to delete this creator?')) return;

    try {
      await api.delete(`/creators/${id}`);
      setCreators(prev => prev.filter(c => c._id !== id));
      add('Creator deleted successfully', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting creator';
      add(msg, 'error');
    }
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || creator.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const platforms = ['all', 'Instagram', 'YouTube',
    //  'TikTok',
      'X'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Creator Management
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', platform: 'Instagram', username: '', profileImageUrl: '' });
            setError('');
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Creator
        </button>
      </div>

      {/* Add/Edit Creator Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-slideDown">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Creator' : 'Add New Creator'}
          </h3>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creator Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform *
                </label>
                <select
                  value={form.platform}
                  onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Instagram</option>
                  <option>YouTube</option>
                  {/* <option>TikTok</option> */}
                  <option>X</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username/Handle *
                </label>
                <input
                  type="text"
                  placeholder="e.g., @johndoe"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center">
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      Choose Image
                    </div>
                  </label>
                  {uploading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {form.profileImageUrl && (
              <div className="mt-2">
                <img
                  src={form.profileImageUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ name: '', platform: 'Instagram', username: '', profileImageUrl: '' });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Creator' : 'Create Creator')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'All Platforms' : platform}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Creators Grid */}
      {filteredCreators.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No creators found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new creator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map(creator => (
            <div
              key={creator._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
            >
              <div className="relative h-40">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-colors duration-300" />
                {creator.profileImageUrl ? (
                  <img
                    src={creator.profileImageUrl}
                    alt={creator.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <UserGroupIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex space-x-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => { e.preventDefault(); handleEdit(creator); }}
                    className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-white rounded-xl shadow-lg"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); deleteCreator(creator._id); }}
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-white rounded-xl shadow-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-lg shadow-sm">
                    {creator.platform}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{creator.name}</h3>
                  <p className="text-sm font-medium text-gray-500">@{creator.username}</p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Followers</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {(creator.followers || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Engage</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {creator.engagementRate || 0}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Posts</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {creator.posts || 0}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/creators/${creator._id}`}
                  className="mt-6 flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-blue-200"
                >
                  <EyeIcon className="h-5 w-5" />
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}