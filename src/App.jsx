import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Header from './components/Header.jsx'
import Dashboard from './components/dashboard.jsx'
import Login_Register from './components/Login_Register.jsx';
import ProtectedRoute from './hooks/ProtectedRoute.jsx'
import WaitingRoom from './components/WaitingRoom.jsx';

function App() {
  const location = useLocation();

  const noHeaderPaths = ['/verify-email'];

  return (
    <>
      {!noHeaderPaths.includes(location.pathname) && <Header />}
      <Routes>
        <Route path='/' element={
          <ProtectedRoute>
            <div className='app-body'>
              <Dashboard />
            </div>
          </ProtectedRoute>
        }/>
        <Route path='/verify-email' element={<WaitingRoom />}/>
        <Route path='/account' element={<Login_Register />}/>
      </Routes>
    </>
  )
}

export default App