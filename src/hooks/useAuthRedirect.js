import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const useAuthRedirect = (redirectPath = '/') => {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate(redirectPath);
            }
        });

        return () => unsubscribe();
    }, [navigate, redirectPath]);
};

export default useAuthRedirect;