import './Dashboard.css';
import useProtectedRoute from '../hooks/useProtectedRoute';

const Dashboard = () => {
    useProtectedRoute();

    return (
        <div className ='dashboard-body'>
            <h1>Dashboard</h1>
        </div>
    )
}

export default Dashboard;