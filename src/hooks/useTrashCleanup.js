import { useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

export const useTrashCleanup = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const cleanupTrash = async () => {
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                const { error } = await supabase
                    .from('notes')
                    .delete()
                    .eq('isTrashed', true)
                    .lt('trashedAt', thirtyDaysAgo.toISOString()); 

                if (error) throw error;
                
            } catch (error) {
                console.error("Error cleaning up trash:", error.message);
            }
        };

        cleanupTrash();
    }, [user]);
};