import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Trash.css';

const Trash = ({ isGridView }) => {
    const [user] = useAuthState(auth);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notes"),
            where("userId", "==", user.uid),
            where("isTrashed", "==", true) 
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleRestore = async (noteId) => {
        await updateDoc(doc(db, "notes", noteId), {
            isTrashed: false
        });
    };

    const handleDeleteForever = async (noteId) => {
        if (window.confirm("Delete forever? This cannot be undone.")) {
            await deleteDoc(doc(db, "notes", noteId));
        }
    };

    return (
        <div className='trash-body'>
            {loading ? (
                <div className="trash-loading-screen">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
            ) : (
                <div className={`trash-grid ${isGridView ? '' : 'list-view'}`}>
                    {notes.map(note => (
                        <div key={note.id} className="trash-note-card">
                            <div className="trash-note-content">
                                {note.title && <h1>{note.title}</h1>}
                                <p>{note.content}</p>
                            </div>
                            <div className="trash-note-buttons">
                                <button className='trash-restore-btn' onClick={() => handleRestore(note.id)} data-tooltip-text='Restore Note'>
                                    <i className="fa-solid fa-trash-arrow-up"></i>
                                </button>
                                <button className='trash-delete-btn' onClick={() => handleDeleteForever(note.id)} data-tooltip-text='Delete Forever'>
                                    <i className="fa-solid fa-ban"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && notes.length === 0 && 
                <div className="trash-empty-state">
                    <i className="fa-regular fa-trash-can"></i>
                    <p>Trash is empty</p>
                </div>
            }
        </div>
    );
};

export default Trash;