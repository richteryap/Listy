import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import EditNote from './AddNote/EditNote.jsx';
import './Dashboard.css';

const Dashboard = () => {
    const [user] = useAuthState(auth);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notes"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotes(notesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDelete = async (e, noteId) => {
        e.stopPropagation();
        const confirmDelete = window.confirm("Delete this note?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "notes", noteId));
            } catch (error) {
                console.error("Error deleting note:", error);
            }
        }
    };

    return (
        <div className ='dashboard-body'>
            {loading ? (
                <div className="dashb-loading-screen">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
            ) : (
                <div className="dashb-grid">
                    {notes.map(note => (
                        <div key={note.id} className="note-card" onClick={(e) => {e.stopPropagation(); setSelectedNote(note);}}>
                            <div className="note-content">
                                {note.title && <h3>{note.title}</h3>}
                                <p>{note.content}</p>
                            </div>
                            <div className="note-actions">
                                <button className='pin-btn'>
                                    <i className="fa-solid fa-thumbtack"></i>
                                </button>
                                <button className='checkbox-btn'>
                                    <i className="fa-solid fa-check-square"></i>
                                </button>
                                <button className='image-btn'>
                                    <i className="fa-regular fa-image"></i>
                                </button>
                                <button className='tags-btn'>
                                    <i className="fa-solid fa-tags"></i>
                                </button>
                                <button className='archive-btn'>
                                    <i className="fa-solid fa-box-archive"></i>
                                </button>
                                <button className="delete-btn" onClick={(e) => handleDelete(e, note.id)}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && notes.length === 0 && (
                        <div className="empty-state">
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