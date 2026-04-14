import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SnackbarProvider } from './components/SnackbarContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
// import { useTrashCleanup } from './hooks/useTrashCleanup.js';
import Header from './components/Header/Header.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Login_Register from './pages/Login_Register/Login_Register.jsx';
import ProtectedRoute from './hooks/ProtectedRoute.jsx'
import Archive from './pages/Archive/Archive.jsx';
import Trash from './pages/Trash/Trash.jsx';
import SearchResults from './pages/SearchResults/SearchResults.jsx';
import Profile from './pages/Profile/Profile.jsx';
import './App.css'

function App() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const [isGridView, setIsGridView] = useState(() => {
    return localStorage.getItem('viewMode') === 'grid';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', isGridView ? 'grid' : 'list');
  }, [isGridView]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
      return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // useTrashCleanup(user?.uid);

  return (
    <AuthProvider>
      <SnackbarProvider>
        <Header 
          isGridView={isGridView} 
          setIsGridView={setIsGridView}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Routes>
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <div className='app-body'>
                <Dashboard isGridView={isGridView} isDarkMode={isDarkMode} searchQuery={searchQuery}/>
              </div>
            </ProtectedRoute>
          }/>
          <Route path='/search' element={
            <ProtectedRoute>
              <div className='app-body'>
                <SearchResults isGridView={isGridView} isDarkMode={isDarkMode}/>
              </div>
            </ProtectedRoute>
          }/>
          <Route path='/archive' element={
            <ProtectedRoute>
              <Archive isGridView={isGridView} isDarkMode={isDarkMode} searchQuery={searchQuery}/>
            </ProtectedRoute>
          }/>
          <Route path='/trash' element={
            <ProtectedRoute>
              <Trash isGridView={isGridView} isDarkMode={isDarkMode}/>
            </ProtectedRoute>
          }/>
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile isDarkMode={isDarkMode}/>
            </ProtectedRoute>
          }/>
          <Route path='/account' element={<Login_Register isDarkMode={isDarkMode}/>}/>
          <Route path='*' element={<Navigate to='/dashboard' replace />}/>
        </Routes>
      </SnackbarProvider>
    </AuthProvider>
  )
}

export default App