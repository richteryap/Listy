import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { db } from '../db';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const hydrateLocalDatabase = async () => {
        try {
            const response = await api.get('/notes/');
            const data = response.data;

            if (data) {
                // Map
                const notesForDexie = data.map(n => ({
                    id: n.id,
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

                await db.notes.clear();
                await db.notes.bulkPut(notesForDexie);
                console.log("Local Dexie database hydrated with Render cloud notes.");
            }
        } catch (err) {
            console.error("Hydration Error:", err.message);
        }
    };

    const initializeSession = async () => {
        const token = localStorage.getItem('access_token');

        if (token) {
            try {
                const profileResponse = await api.get('/auth/profile/');
                const userData = profileResponse.data;

                setUser({
                    isAuthenticated: true,
                    id: userData.id,
                    email: userData.email
                });

                setProfile(userData);

                await hydrateLocalDatabase();
            } catch (error) {
                console.error("Session expired or invalid:", error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        initializeSession();
    }, []);

    const login = async (access, refresh) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setLoading(true);
        await initializeSession();
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setProfile(null);
        db.notes.clear();
    };

    return (
        <AuthContext.Provider value={{ user, setUser, profile, setProfile, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);