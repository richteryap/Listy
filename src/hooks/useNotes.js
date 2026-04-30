import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '../context/AuthContext';
import { db } from '../db';

export const useNotes = (filterType, searchQuery = '') => {
    const { user } = useAuth();

    const notes = useLiveQuery(async () => {
        if (!user) return [];

        const allNotes = await db.notes.toArray();
        
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
        return filtered.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return b.isPinned ? -1 : 1;
            const dateA = new Date(a.updatedAt || a.createdAt || 0);
            const dateB = new Date(b.updatedAt || b.createdAt || 0);
            return dateB - dateA;
        });
    }, [filterType, searchQuery, user?.id]);

    return {
        notes: notes || [],
        loading: notes === undefined
    };
};