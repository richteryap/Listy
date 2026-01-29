import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const ProtectedRoute = ({ children }) => {
    const [user, loading] = useAuthState(auth); 

    if (loading) {
        return (
            <div className="loading-screen">
                <i className="fa-solid fa-spinner fa-spin"></i>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/account" replace />;
    }

    if (!user.emailVerified) {
        return (
            <div className="verify-screen">
                <h1>Please Verify Your Email</h1>
                <p>We sent a link to {user.email}. Check your spam folder!</p>
                <button onClick={() => window.location.reload()}>
                    I have verified it (Refresh)
                </button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;