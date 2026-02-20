import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Creators from './pages/Creators';
import CreatorDetails from './pages/CreatorDetails';
import Admin from './pages/Admin';
import { ToastProvider } from './components/Toast';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            user={user} 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          {/* Main content area with left margin on desktop to account for fixed sidebar */}
          <div className="flex flex-col flex-1 overflow-hidden lg:ml-72">
            <Navbar 
              user={user} 
              onMenuClick={() => setSidebarOpen(true)} 
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/creators" element={<Creators />} />
                <Route path="/creators/:id" element={<CreatorDetails />} />
                {user?.role === 'admin' && (
                  <Route path="/admin" element={<Admin />} />
                )}
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;