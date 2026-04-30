import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../db';
import { useSnackbar } from '../components/SnackbarContext';
import api from '../api/axios.js';

export const useNoteActions = () => {
    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();

    const addNote = async (noteData) => {
        try {
            const response = await api.post('/notes/', noteData);
            const newNote = response.data;

            // Map 
            const noteForDexie = {
                id: newNote.id,
                title: newNote.title,
                content: newNote.content,
                isList: newNote.is_list,
                listItems: newNote.list_items,
                isTrashed: newNote.is_trashed,
                isArchived: newNote.is_archived,
                isPinned: newNote.is_pinned,
                imageUrl: newNote.image_url,
                createdAt: newNote.created_at,
                updatedAt: newNote.updated_at
            };

            // Save to Dexie
            await db.notes.add(noteForDexie);
            return { success: true, data: noteForDexie };
        } catch (error) {
            console.error("Error creating note on server:", error);
            showSnackbar("Failed to save note");
            return { success: false, error };
        }
    };

    const syncToCloud = async (note) => {
        if (!user) return;

        try {
            await api.put(`/notes/${note.id}/`, {
                title: note.title,
                content: note.content,
                is_list: note.isList,
                list_items: note.listItems,
                is_trashed: note.isTrashed,
                is_archived: note.isArchived,
                is_pinned: note.isPinned,
                image_url: note.imageUrl,
            });
            console.log("Sync successful for note:", note.id);
        } catch (error) {
            console.error("Cloud Sync Error:", error);
            showSnackbar("Sync failed. Changes saved locally.");
        }
    };

    const uploadImageToCloud = async (file, noteId) => {
        if (!user) throw new Error("Must be logged in to upload images");

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post(`/notes/${noteId}/upload-image/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.image_url;
        } catch (error) {
            console.error("Image upload error:", error);
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
                // Delete locally
                await db.notes.delete(noteId);

                // Delete from Django
                if (user) {
                    await api.delete(`/notes/${noteId}/`);
                }

                showSnackbar("Note deleted", null);
            } catch (error) {
                console.error("Error deleting note:", error);
                showSnackbar("Failed to delete note from cloud");
            }
        }
    };

    const updateNoteImage = async (noteId, base64) => {
        await updateLocalNote(noteId, {
            imageUrl: base64
        });
    };

    return {
        addNote, uploadImageToCloud, syncToCloud, toggleNoteListMode,
        dbTogglePin, archiveTogglePin, archiveNote, unarchiveNote, dbTrashNote,
        archiveTrashNote, restoreNote, deleteNoteForever, updateNoteImage
    };
};