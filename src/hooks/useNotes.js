import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const useNotes = (filterType, searchQuery = '') => {
    const { user } = useAuth();
    const [allNotes, setAllNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch notes from Django
    const fetchNotes = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('access_token');

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/notes/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAllNotes(response.data);
        } catch (error) {
            console.error("Failed to fetch notes from Django:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [user]);

    let filtered = [];

    // Page filtering
    if (filterType === 'trash') {
        filtered = allNotes.filter(n => n.isTrashed === true);
    } else if (filterType === 'archive') {
        filtered = allNotes.filter(n => n.isArchived === true && !n.isTrashed);
    } else if (filterType === 'dashboard') {
        filtered = allNotes.filter(n => !n.isTrashed && !n.isArchived);
    } else if (filterType === 'search') {
        filtered = allNotes.filter(n => !n.isTrashed);
    } else {
        filtered = allNotes;
    }

    // Search filtering
    if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(n => {
            const titleMatch = n.title?.toLowerCase().includes(query);
            const contentMatch = n.content?.toLowerCase().includes(query);
            const listMatch = n.isList && n.listItems?.some(item =>
                item.text.toLowerCase().includes(query)
            );
            return titleMatch || contentMatch || listMatch;
        });
    }

    // Sorting
    const sortedNotes = filtered.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned ? -1 : 1;
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
    });

    // Return the notes, loading state, and a way to manually refresh
    return {
        notes: sortedNotes || [],
        loading,
        refetchNotes: fetchNotes
    };
};