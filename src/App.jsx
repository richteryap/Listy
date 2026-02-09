import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SnackbarProvider } from './components/context/SnackbarContext.jsx';
import { useTrashCleanup } from './hooks/useTrashCleanup.js';
import './App.css'
import Header from './components/Header/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import Login_Register from './components/Account/Login_Register.jsx';
import ProtectedRoute from './hooks/ProtectedRoute.jsx'
import WaitingRoom from './components/Account/WaitingRoom.jsx';
import Archive from './components/OtherComps/Archive.jsx';
import Trash from './components/OtherComps/Trash.jsx';
import SearchResults from './components/Header/SearchResults.jsx';

function App() {
  const location = useLocation();
  const noHeaderPaths = ['/verify-email'];

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

  useTrashCleanup();

  return (
    <>
      <SnackbarProvider>
        {!noHeaderPaths.includes(location.pathname) && (
          <Header 
            isGridView={isGridView} 
            setIsGridView={setIsGridView}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {searchQuery.trim().length > 0 ? (
          <div className='app-body'>
            <SearchResults
              searchQuery={searchQuery}
              isGridView={isGridView}
            />
          </div>
        ) : (
          <Routes>
            <Route path='/' element={
              <ProtectedRoute>
                <div className='app-body'>
                  <Dashboard isGridView={isGridView} isDarkMode={isDarkMode} searchQuery={searchQuery}/>
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
            <Route path='/verify-email' element={<WaitingRoom isDarkMode={isDarkMode} />}/>
            <Route path='/account' element={<Login_Register  isDarkMode={isDarkMode}/>}/>
            <Route path='*' element={<Navigate to='/' replace />}/>
          </Routes>
        )}
      </SnackbarProvider>
    </>
  )
}

export default App