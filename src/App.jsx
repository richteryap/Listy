import { Routes, Route } from 'react-router-dom';
import './App.css'
import Header from './components/Header.jsx'
import Dashboard from './components/dashboard.jsx'
import Login_Register from './components/Login_Register.jsx';
import ProtectedRoute from './hooks/ProtectedRoute.jsx'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={
          <ProtectedRoute>
            <div className='app-body'>
              <Dashboard />
            </div>
          </ProtectedRoute>
        }/>
        <Route path='/account' element={<Login_Register />}/>
      </Routes>
    </>
  )
}

export default App