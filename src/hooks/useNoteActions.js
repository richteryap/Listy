import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSnackbar } from '../components/context/SnackbarContext';

export const useNoteActions = () => {
    const { showSnackbar } = useSnackbar();

    const toggleNoteListMode = async (note) => {
        const noteRef = doc(db, "notes", note.id);

        if (note.isList) {
            const textContent = note.listItems 
                ? note.listItems.map(item => item.text).join('\n') 
                : '';
            
            await updateDoc(noteRef, {
                isList: false,
                content: textContent
            });
        } else {
            const currentContent = note.content || '';
            const items = currentContent.split('\n')
                .filter(line => line.trim() !== '')
                .map(text => ({
                    id: Date.now() + Math.random(),
                    text: text,
                    isChecked: false
                }));
            
            if (items.length === 0) {
                items.push({ id: Date.now(), text: '', isChecked: false });
            }

            await updateDoc(noteRef, {
                isList: true,
                listItems: items,
                content: ''
            });
        }
    };

    const dbTogglePin = async (noteId, currentStatus) => {
        await updateDoc(doc(db, "notes", noteId), { 
            isPinned: !currentStatus,
            isArchived: false,
            isTrashed: false
        });
    };

    const archiveTogglePin = async (noteId, currentStatus) => {
        await updateDoc(doc(db, "notes", noteId), { 
            isPinned: !currentStatus,
            isArchived: false,
            isTrashed: false
        });

        showSnackbar("Note unarchived and pinned", async () => {
            await updateDoc(doc(db, "notes", noteId), {
                isPinned: currentStatus,
                isArchived: true,
                isTrashed: false
            });
        });
    };

    const archiveNote = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isArchived: true,
            isPinned: false,
            isTrashed: false
        });

        showSnackbar("Note archived", async () => {
            await updateDoc(doc(db, "notes", noteId), {
                isArchived: false,
                isTrashed: false
            });
        });
    };

    const unarchiveNote = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isArchived: false,
            isTrashed: false
        });

        showSnackbar("Note unarchived", async () => {
            await updateDoc(doc(db, "notes", noteId), {
                isArchived: true,
                isTrashed: false
            });
        });
    };

    const dbTrashNote = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isTrashed: true,
            isPinned: false
        });

        showSnackbar("Note moved to trash", async () => {
            await updateDoc(doc(db, "notes", noteId), {
                isTrashed: false,
            });
        });
    };

    const archiveTrashNote = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isTrashed: true,
            isArchived: false
        });

        showSnackbar("Note moved to trash", async () => {
            await updateDoc(doc(db, "notes", noteId), {
                isArchived: true,
                isTrashed: false
            });
        });
    };

    const restoreNote = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isTrashed: false,
            isArchived: false
        });

        showSnackbar("Note restored", async () => {
            await updateDoc(doc(db, "notes", noteId), {
                isTrashed: true,
                isArchived: false
            });
        });
    };

    const deleteNoteForever = async (noteId) => {
        if (window.confirm("Delete forever? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "notes", noteId));
                showSnackbar("Note deleted", null);
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    return { toggleNoteListMode, dbTogglePin, archiveTogglePin, archiveNote, unarchiveNote, dbTrashNote, archiveTrashNote, restoreNote, deleteNoteForever };
};