import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateNote from './pages/CreateNote';
import NoteView from './pages/NoteView';
import Recent from './pages/Recent';
import ShareView from './pages/ShareView';
import Profile from './pages/Profile';
import CategorySelect from './components/CategorySelect';
import CategoryPage from './pages/CategoryPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return !user ? children : <Navigate to="/dashboard" />;
};

const OldUsernameRedirect = () => {
  const { username } = useParams();
  return <Navigate to={`/user/${username}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recent" element={<Recent />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/note/:slug" element={<NoteView />} />
              <Route path="/share/:shareLink" element={<ShareView />} />
              <Route path="/@:username" element={<OldUsernameRedirect />} />
              <Route path="/user/:username" element={<Profile />} />
              <Route path="/login" element={
                <PublicRoute><Login /></PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute><Register /></PublicRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              <Route path="/new" element={
                <PrivateRoute><CreateNote /></PrivateRoute>
              } />
              <Route path="/select-category" element={
                <PrivateRoute><CategorySelect /></PrivateRoute>
              } />
              <Route path="/edit/:id" element={
                <PrivateRoute><CreateNote /></PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
