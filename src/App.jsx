import './App.css'
import Header from './components/Header.jsx'
import Dashboard from './components/dashboard.jsx'

function App() {
  return (
    <>
      <Header />
      <div className='app-body'>
        <Dashboard />
      </div>
    </>
  )
}

export default App