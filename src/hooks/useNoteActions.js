import { supabase } from '../supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../db';
import { useSnackbar } from '../components/SnackbarContext';

export const useNoteActions = () => {
    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();

    const pullFromCloud = async () => {
        if (!user) return;

        console.log("Fetching notes from cloud...");
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error("Error pulling from cloud:", error.message);
            return;
        }

        if (data) {
            // Transform snake_case from DB back to camelCase for Dexie
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

            // bulkPut adds new notes and updates existing ones in one go
            await db.notes.bulkPut(notesForDexie);
            console.log("Local database hydrated!");
        }
    };

    const syncToCloud = async (note) => {
        if (!user) return;

        const { error } = await supabase
            .from('notes')
            .upsert({
                id: note.id,
                user_id: user.id,
                title: note.title,
                content: note.content,
                is_list: note.isList,
                list_items: note.listItems,
                is_trashed: note.isTrashed,
                is_archived: note.isArchived,
                is_pinned: note.isPinned,
                image_url: note.imageUrl, 
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Cloud Sync Error:", error.message);
        } else {
            console.log("Sync successful for note:", note.id);
        }
    };

    const uploadImageToCloud = async (file, noteId) => {
        if (!user) throw new Error("Must be logged in to upload images");

        // Create a safe, unique filename: "user-id/note-id-timestamp.jpg"
        const fileExt = file.name.split('.').pop();
        const fileName = `${noteId}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`; 

        try {
            // Upload the raw File object to the 'note_images' bucket
            const { error: uploadError } = await supabase.storage
                .from('note_images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false 
                });

            if (uploadError) throw uploadError;

            // Ask Supabase for the permanent public URL 
            const { data } = supabase.storage
                .from('note_images')
                .getPublicUrl(filePath);

            return data.publicUrl;

        } catch (error) {
            console.error("Storage upload error:", error.message);
            throw error;
        }
    };

    // Helper for repetitive update logic
    const updateLocalNote = async (noteId, changes) => {
        try {
            await db.notes.update(noteId, {
                ...changes,
                updatedAt: new Date().toISOString()
            });

            const updatedNote = await db.notes.get(noteId);

            if (updatedNote) {
                await syncToCloud(updatedNote);
            }
        } catch (error) {
            console.error("Local Update Error:", error);
        }
    };

    const toggleNoteListMode = async (note) => {
        if (note.isList) {
            const textContent = note.listItems 
                ? note.listItems.map(item => item.text).join('\n') 
                : '';
            
            await updateLocalNote(note.id, {
                isList: false,
                content: textContent,
            });
        } else {
            const currentContent = note.content || '';
            const items = currentContent.split('\n')
                .filter(line => line.trim() !== '')
                .map(text => ({
                    id: crypto.randomUUID(),
                    text: text,
                    isChecked: false
                }));
            
            if (items.length === 0) {
                items.push({
                    id: crypto.randomUUID(),
                    text: '',
                    isChecked: false
                });
            }

            await updateLocalNote(note.id, {
                isList: true,
                listItems: items,
                content: '',
            });
        }
    };

    const dbTogglePin = async (noteId, currentStatus) => {
        await updateLocalNote(noteId, { 
            isPinned: !currentStatus,
            isArchived: false,
            isTrashed: false
        });
    };

    const archiveTogglePin = async (noteId, currentStatus) => {
        await updateLocalNote(noteId, { 
            isPinned: !currentStatus,
            isArchived: false,
            isTrashed: false
        });

        showSnackbar("Note unarchived and pinned", async () => {
            await updateLocalNote(noteId, {
                isPinned: currentStatus,
                isArchived: true,
            });
        });
    };

    const archiveNote = async (noteId) => {
        await updateLocalNote(noteId, {
            isArchived: true,
            isPinned: false,
            isTrashed: false
        });

        showSnackbar("Note archived", async () => {
            await updateLocalNote(noteId, { 
                isArchived: false
            });
        });
    };

    const unarchiveNote = async (noteId) => {
        await updateLocalNote(noteId, {
            isArchived: false,
            isTrashed: false
        });

        showSnackbar("Note unarchived", async () => {
            await updateLocalNote(noteId, {
                isArchived: true
            });
        });
    };

    const dbTrashNote = async (noteId) => {
        await updateLocalNote(noteId, {
            isTrashed: true,
            isArchived: false,
            isPinned: false,
            trashedAt: new Date().toISOString()
        });

        showSnackbar("Note moved to trash", async () => {
            await updateLocalNote(noteId, {
                isTrashed: false
            });
        });
    };

    const archiveTrashNote = async (noteId) => {
        await updateLocalNote(noteId, {
            isTrashed: true,
            isArchived: false,
            trashedAt: new Date().toISOString()
        });

        showSnackbar("Note moved to trash", async () => {
            await updateLocalNote(noteId, {
                isArchived: true,
                isTrashed: false
            });
        });
    };

    const restoreNote = async (noteId) => {
        await updateLocalNote(noteId, {
            isTrashed: false,
            isArchived: false
        });

        showSnackbar("Note restored", async () => {
            await updateLocalNote(noteId, {
                isTrashed: true
            });
        });
    };

    const deleteNoteForever = async (noteId) => {
        if (window.confirm("Delete forever? This cannot be undone.")) {
            try {
                await db.notes.delete(noteId);

                if (user) {
                    await supabase.from('notes').delete().eq('id', noteId);
                }
                
                showSnackbar("Note deleted", null);
            } catch (error) {
                console.error("Error deleting locally:", error);
            }
        }
    };

    const updateNoteImage = async (noteId, base64) => {
        await updateLocalNote(noteId, {
            imageUrl: base64
        });
    };

    return { 
        uploadImageToCloud, pullFromCloud, syncToCloud, toggleNoteListMode,
        dbTogglePin, archiveTogglePin, archiveNote, unarchiveNote, dbTrashNote,
        archiveTrashNote, restoreNote,  deleteNoteForever, updateNoteImage 
    };
};