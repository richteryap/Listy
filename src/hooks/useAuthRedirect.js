import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useAuthRedirect = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);
};

export default useAuthRedirect;