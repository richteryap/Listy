import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const useProtectedRoute = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // REVERSE LOGIC: If NO user is found, send them to login
            if (!user) {
                navigate('/account'); 
            }
        });

        return () => unsubscribe();
    }, [navigate]);
};

export default useProtectedRoute;