import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../Dashboard.css'; // Re-use Dashboard CSS!
import './Trash.css';

const Trash = () => {
    const [user] = useAuthState(auth);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        if (!user) return;

        // QUERY: Only show items tagged as 'isTrashed'
        const q = query(
            collection(db, "notes"),
            where("userId", "==", user.uid),
            where("isTrashed", "==", true) 
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
        });
        return () => unsubscribe();
    }, [user]);

    // Action: Restore (Move back to Dashboard)
    const handleRestore = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isTrashed: false
        });
    };

    // Action: Delete Forever (Actually remove from DB)
    const handleDeleteForever = async (noteId) => {
        if (window.confirm("Delete forever? This cannot be undone.")) {
            await deleteDoc(doc(db, "notes", noteId));
        }
    };

    return (
        <div className='dashboard-body'>
             <div className="notes-grid">
                {notes.map(note => (
                    <div key={note.id} className="note-card">
                        <div className="note-content">
                            {note.title && <h3>{note.title}</h3>}
                            <p>{note.content}</p>
                        </div>
                        <div className="note-actions">
                            <button onClick={() => handleRestore(note.id)} title="Restore">
                                <i className="fa-solid fa-trash-arrow-up"></i>
                            </button>
                            <button onClick={() => handleDeleteForever(note.id)} title="Delete Forever">
                                <i className="fa-solid fa-ban"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {notes.length === 0 && 
                <div className="empty-state">
                    <i className="fa-regular fa-trash-can"></i>
                    <p>Trash is empty</p>
                </div>
            }
        </div>
    );
};

export default Trash;