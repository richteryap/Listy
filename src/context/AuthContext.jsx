import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { db } from '../db';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const hydrateLocalDatabase = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            if (data) {
                const notesForDexie = data.map(n => ({
                    id: n.id,
                    user_id: n.user_id,
                    title: n.title,
                    content: n.content,
                    isList: n.is_list,
                    listItems: n.list_items,
                    isTrashed: n.is_trashed,
                    isArchived: n.is_archived,
                    isPinned: n.is_pinned,
                    imageUrl: n.image_url,
                    createdAt: n.created_at,
                    updatedAt: n.updated_at
                }));

                await db.notes.bulkPut(notesForDexie);
                console.log("Local database hydrated with cloud notes.");
            }
        } catch (err) {
            console.error("Hydration Error:", err.message);
        }
    };

    const fetchProfile = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    };

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            if (currentUser) {
                fetchProfile(currentUser.id);
                hydrateLocalDatabase(currentUser.id);
            }
            setLoading(false);
        });

        // Listen for Auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                fetchProfile(currentUser.id);
                
                if (event === 'SIGNED_IN') {
                    hydrateLocalDatabase(currentUser.id);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);