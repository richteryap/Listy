import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { autoSync } from '../utils/syncService';

export const useNotes = (filterType, searchQuery = '') => {
    const { user } = useAuth();

    // Trigger auto-sync when user changes (logs in)
    useEffect(() => {
        if (user) {
            autoSync(user);
        }
    }, [user]);

    // Live query from Dexie
    const allNotes = useLiveQuery(
        () => db.notes.toArray(),
        [], // dependencies
        [] // default result while loading
    );

    const loading = allNotes === undefined;

    let filtered = allNotes || [];

    // Page filtering
    if (filterType === 'trash') {
        filtered = filtered.filter(n => n.isTrashed === true);
    } else if (filterType === 'archive') {
        filtered = filtered.filter(n => n.isArchived === true && !n.isTrashed);
    } else if (filterType === 'dashboard') {
        filtered = filtered.filter(n => !n.isTrashed && !n.isArchived);
    } else if (filterType === 'search') {
        filtered = filtered.filter(n => !n.isTrashed);
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
        refetchNotes: () => { if (user) autoSync(user); }
    };
};