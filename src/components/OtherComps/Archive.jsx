import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../Dashboard.css'; // Re-use Dashboard CSS!
import './Archive.css';

const Archive = () => {
    const [user] = useAuthState(auth);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notes"),
            where("userId", "==", user.uid),
            where("isArchived", "==", true),
            where("isTrashed", "==", false) 
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
        });
        return () => unsubscribe();
    }, [user]);

    const handleUnarchive = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isArchived: false
        });
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
                            <button onClick={() => handleUnarchive(note.id)} title="Unarchive">
                                <i className="fa-solid fa-box-open"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {notes.length === 0 &&
                <div className='empty-state'>
                    <i className='fa-regular fa-box-open'></i>
                    <p>Archive is empty</p>
                </div>
            }
        </div>
    );
};

export default Archive;