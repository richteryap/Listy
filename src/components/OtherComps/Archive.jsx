import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, or } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import EditNote from '../AddNote/EditNote.jsx';
import './Archive.css';

const Archive = ({ isGridView }) => {
    const [user] = useAuthState(auth);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [animate, setAnimate] = useState(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notes"),
            where("userId", "==", user.uid),
            where("isArchived", "==", true),
            where("isTrashed", "==", false),
            orderBy("isPinned", "desc"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAnimate = (note) => {
        setAnimate(note.id);

        setTimeout(() => {
            setSelectedNote(note);
            setAnimate(null);
        }, 100);
    }

    const handlePin = async (noteId, isPinned) => {
        await updateDoc(doc(db, "notes", noteId), {
            isPinned: !isPinned
        });
    }

    const handleUnarchive = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isArchived: false
        });
    };

    const handleTrash = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isTrashed: true,
        });
    }

    return (
        <div className='archive-body'>
            {loading ? (
                <div className="archive-loading-screen">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
            ) : (
                <div className={`archive-grid ${isGridView ? '' : 'list-view'}`}>
                    {notes.map(note => (
                        <div key={note.id} className={`archive-note-card ${selectedNote?.id === note.id || animate === note.id ? 'selected' : ''}`}>
                            <div className="archive-note-content" onClick={(e) => {e.stopPropagation(); handleAnimate(note);}}>
                                {note.title && <h1>{note.title}</h1>}
                                <p>{note.content}</p>
                            </div>
                            <div className="archive-note-buttons">
                                <button className={`archive-pin-btn ${note.isPinned ? 'active' : ''}`} onClick={(e) => {e.stopPropagation(); handlePin(note.id, note.isPinned);}} data-tooltip-text={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                                    <i className="fa-solid fa-thumbtack"></i>
                                </button>
                                <button className='archive-checkbox-btn' onClick={(e) => {e.stopPropagation();}} data-tooltip-text='Show Tick Boxes'>
                                    <i className="fa-solid fa-check-square"></i>
                                </button>
                                <button className='archive-image-btn' onClick={(e) => {e.stopPropagation();}} data-tooltip-text='Add Image'>
                                    <i className="fa-regular fa-image"></i>
                                </button>
                                <button className='archive-unarchive-btn' onClick={(e) => {e.stopPropagation(); handleUnarchive(note.id);}} data-tooltip-text='Unarchive Note'>
                                    <i className="fa-solid fa-box-open"></i>
                                </button>
                                <button className='archive-delete-btn' onClick={(e) => {e.stopPropagation(); handleTrash(note.id);}} data-tooltip-text='Move to Trash'>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && notes.length === 0 &&
                        <div className='archive-empty-state'>
                            <i className='fa-regular fa-box-open'></i>
                            <p>Archive is empty</p>
                        </div>
                    }
                </div>
            )}

            {selectedNote && (
                <EditNote 
                    note={selectedNote}
                    onClose={() => setSelectedNote(null)}
                />
            )}
        </div>
    );
};

export default Archive;