import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios.js';

export const useTrashCleanup = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const cleanupTrash = async () => {
            try {
                await api.delete('/notes/cleanup-trash/');
            } catch (error) {
                console.error("Error cleaning up trash:", error);
            }
        };

        cleanupTrash();
    }, [user]);
};