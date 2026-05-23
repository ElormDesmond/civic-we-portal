import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import News from './pages/News'
import Projects from './pages/Projects'
import Dashboard from './pages/Dashboard'
import Permits from './pages/Permits'
import BuildingPermit from './pages/BuildingPermit'
import ProtectedRoute from './components/ProtectedRoute'
import SearchBar from './components/SearchBar'
import './App.css'

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8888/api/logout', { method: 'POST', credentials: 'include' });
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div className="flex items-center space-x-6 flex-grow">
        <Link to="/" className="text-xl font-bold text-blue-600 flex-shrink-0">Civic Portal</Link>
        <div className="hidden lg:flex space-x-6 items-center flex-shrink-0">
          <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">About</Link>
          <Link to="/news" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">News</Link>
          <Link to="/projects" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">Projects</Link>
        </div>
        <div className="hidden sm:block flex-grow max-w-xs md:max-w-sm ml-2">
          <SearchBar />
        </div>
      </div>
      <div className="space-x-4 flex-shrink-0 flex items-center">
        {user && user.role === 'citizen' && (
          <div className="hidden md:flex space-x-4 mr-4">
            <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition text-sm font-medium">Dashboard</Link>
            <Link to="/apply" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition text-sm font-medium">Apply</Link>
          </div>
        )}
        {user ? (
          <>
            <span className="text-gray-700 dark:text-gray-300 hidden xl:inline text-sm">Welcome, {user.full_name}</span>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-500 font-medium text-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 text-sm">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Building a Smarter Community
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10">
        Empowering citizens with easy access to municipal services, transparent project tracking, and real-time community updates.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
        <Link to="/about" className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
          <span className="text-3xl mb-4 block">🏛️</span>
          <h3 className="font-bold text-lg mb-2">Government</h3>
          <p className="text-sm text-gray-500">Learn about our departments and officials.</p>
        </Link>
        <Link to="/news" className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
          <span className="text-3xl mb-4 block">📰</span>
          <h3 className="font-bold text-lg mb-2">Updates</h3>
          <p className="text-sm text-gray-500">Stay informed with the latest news.</p>
        </Link>
        <Link to="/projects" className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
          <span className="text-3xl mb-4 block">🏗️</span>
          <h3 className="font-bold text-lg mb-2">Projects</h3>
          <p className="text-sm text-gray-500">Track development in your neighborhood.</p>
        </Link>
      </div>

      <div className="space-x-4">
        {user ? (
          <Link to="/dashboard" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link to="/register" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Get Started</Link>
            <Link to="/login" className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition">Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/news" element={<News />} />
              <Route path="/projects" element={<Projects />} />
              
              {/* Citizen Routes */}
              <Route element={<ProtectedRoute requiredRole="citizen" />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/apply" element={<Permits />} />
                <Route path="/apply/building" element={<BuildingPermit />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
