import { db } from '../db';
import api from '../api/axios';

export const autoSync = async (user) => {
    if (!user) return;

    console.log("Starting background sync...");

    try {
        // STEP 1: Upload offline changes (Local -> Cloud)
        const pendingNotes = await db.notes.where('sync_status').equals('pending').toArray();
        
        for (const note of pendingNotes) {
            try {
                const payload = {
                    title: note.title || '',
                    content: note.content || '',
                    is_list: note.isList || false,
                    list_items: note.listItems || [],
                    is_trashed: note.isTrashed || false,
                    is_archived: note.isArchived || false,
                    is_pinned: note.isPinned || false,
                    image_url: note.imageUrl || null,
                };

                if (typeof note.id === 'string') {
                    // NEW NOTE (created locally with UUID)
                    const response = await api.post('/notes/', payload);
                    const serverNote = response.data;
                    
                    // Replace the local UUID with the server's Integer ID
                    await db.notes.delete(note.id);
                    await db.notes.add({
                        ...note,
                        id: serverNote.id,
                        sync_status: 'synced',
                        createdAt: serverNote.created_at,
                        updatedAt: serverNote.updated_at
                    });
                    console.log(`Synced new note. Local UUID ${note.id} replaced with Server ID ${serverNote.id}`);
                } else {
                    // UPDATED NOTE
                    await api.put(`/notes/${note.id}/`, payload);
                    await db.notes.update(note.id, { sync_status: 'synced' });
                    console.log(`Synced update for note ${note.id}`);
                }
            } catch (err) {
                console.error("Failed to sync note", note.id, err);
                // Keep sync_status as 'pending' so it retries on next sync
            }
        }

        // STEP 2: Download remote changes (Cloud -> Local)
        const response = await api.get('/notes/');
        const remoteNotes = response.data;
        
        const remoteNotesMap = new Map();
        
        for (const remote of remoteNotes) {
            const localFormat = {
                id: remote.id,
                user_id: user.id,
                title: remote.title,
                content: remote.content,
                isList: remote.is_list,
                listItems: remote.list_items,
                isTrashed: remote.is_trashed,
                isArchived: remote.is_archived,
                isPinned: remote.is_pinned,
                imageUrl: remote.image_url,
                sync_status: 'synced',
                createdAt: remote.created_at,
                updatedAt: remote.updated_at,
            };
            remoteNotesMap.set(remote.id, localFormat);
        }
        
        // Merge with local Dexie DB
        const allLocalNotes = await db.notes.toArray();
        // Actually, some pending notes just became 'synced', so their IDs might have changed!
        // It's safer to just re-fetch pending from DB
        const currentPending = await db.notes.where('sync_status').equals('pending').toArray();
        const currentPendingIds = new Set(currentPending.map(n => n.id));

        for (const local of allLocalNotes) {
            // Don't overwrite notes that are still pending upload
            if (currentPendingIds.has(local.id)) continue; 
            
            if (typeof local.id === 'number') {
                if (remoteNotesMap.has(local.id)) {
                    // Remote note exists, check if we need to update local
                    const remote = remoteNotesMap.get(local.id);
                    const remoteTime = new Date(remote.updatedAt).getTime();
                    const localTime = new Date(local.updatedAt).getTime();
                    
                    if (remoteTime > localTime) {
                        await db.notes.put(remote);
                    }
                    remoteNotesMap.delete(local.id); // Processed
                } else {
                    // Note exists locally (synced) but not on remote. It was permanently deleted remotely!
                    await db.notes.delete(local.id);
                }
            }
        }
        
        // Any remaining in remoteNotesMap are new notes created on other devices
        for (const remote of remoteNotesMap.values()) {
            await db.notes.put(remote);
        }
        
        console.log("Background sync complete.");

    } catch (error) {
        console.error("AutoSync failed to complete:", error);
    }
};
