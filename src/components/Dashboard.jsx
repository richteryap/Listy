import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import EditNote from './AddNote/EditNote.jsx';
import './Dashboard.css';

const Dashboard = ({ isGridView }) => {
    const [user] = useAuthState(auth);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notes"),
            where("userId", "==", user.uid),
            where("isTrashed", "==", false),
            where("isArchived", "==", false),
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

    const handlePin = async (noteId, isPinned) => {
        await updateDoc(doc(db, "notes", noteId), {
            isPinned: !isPinned
        });
    }

    const handleArchive = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isArchived: true
        });
    }

    const handleTrash = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isTrashed: true
        });
    }

    return (
        <div className ='dashboard-body'>
            {loading ? (
                <div className="db-loading-screen">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
            ) : (
                <div className={`db-grid ${isGridView ? '' : 'list-view'}`}>
                    {notes.map(note => (
                        <div key={note.id} className={`db-note-card ${selectedNote?.id === note.id ? 'selected' : ''}`}>
                            <div className="note-content" onClick={(e) => {e.stopPropagation(); setSelectedNote(note);}}>
                                {note.title && <h1>{note.title}</h1>}
                                <p>{note.content}</p>
                            </div>
                            <div className="db-note-buttons">
                                <button className={`db-pin-btn ${note.isPinned ? 'active' : ''}`} onClick={(e) => {e.stopPropagation(); handlePin(note.id, note.isPinned);}} data-tooltip-text={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                                    <i className="fa-solid fa-thumbtack"></i>
                                </button>
                                <button className='db-checkbox-btn' onClick={(e) => {e.stopPropagation();}} data-tooltip-text='Show Tick Boxes'>
                                    <i className="fa-solid fa-check-square"></i>
                                </button>
                                <button className='db-image-btn' onClick={(e) => {e.stopPropagation();}} data-tooltip-text='Add Image'>
                                    <i className="fa-regular fa-image"></i>
                                </button>
                                <button className='db-tags-btn' onClick={(e) => {e.stopPropagation();}} data-tooltip-text='Add Tags'>
                                    <i className="fa-solid fa-tags"></i>
                                </button>
                                <button className='db-archive-btn' onClick={(e) => {e.stopPropagation(); handleArchive(note.id);}} data-tooltip-text='Archive Note'>
                                    <i className="fa-solid fa-box-archive"></i>
                                </button>
                                <button className="db-delete-btn" onClick={(e) => {e.stopPropagation(); handleTrash(note.id);}} data-tooltip-text='Move to Trash'>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && notes.length === 0 && (
                        <div className="db-empty-state">
                            <i className="fa-regular fa-lightbulb"></i>
                            <p>Your notes will appear here</p>
                        </div>
                    )}
                </div>
            )}

            {selectedNote && (
                <EditNote
                    note={selectedNote} 
                    onClose={() => setSelectedNote(null)} 
                />
            )}
        </div>
    )
}

export default Dashboard;