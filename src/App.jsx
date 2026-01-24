import { Routes, Route } from 'react-router-dom';
import './App.css'
import Header from './components/Header.jsx'
import Dashboard from './components/dashboard.jsx'
import Login_Register from './components/Login_Register.jsx';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={
          <div className='app-body'>
            <Dashboard />
          </div>
        }/>
        <Route path='/account/' element={<Login_Register />}/>
      </Routes>
    </>
  )
}

export default App