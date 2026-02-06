import { useState, useEffect, useRef } from 'react';
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
    const [animate, setAnimate] = useState(null);

    const [activeNoteId, setActiveNoteId] = useState(null);
    const fileInputRef = useRef(null);

    const pinnedNotes = notes.filter(note => note.isPinned);
    const otherNotes = notes.filter(note => !note.isPinned);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const triggerImageUpload = (e, noteId) => {
        e.stopPropagation();
        setActiveNoteId(noteId);
        
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }, 0);
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        
        if (!file || !activeNoteId) return;
        
        if (file.size > 500000) {
            alert("File is too big! Please select an image under 500KB.");
            e.target.value = null;
            setActiveNoteId(null);
            return;
        }

        try {
            const base64 = await convertToBase64(file);
            
            const noteRef = doc(db, "notes", activeNoteId);
            await updateDoc(noteRef, {
                imageUrl: base64
            });

        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            e.target.value = null;
            setActiveNoteId(null);
        }
    };



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

    const renderNoteCard = (note) => (
        <div key={note.id} className={`db-note-card ${selectedNote?.id === note.id || animate === note.id ? 'selected' : ''}`}>
            <div className="db-note-content" onClick={(e) => {e.stopPropagation(); handleAnimate(note);}}>
                {note.imageUrl && (
                    <div className="db-note-image">
                        <img src={note.imageUrl} alt="Note Attachment" />
                    </div>
                )}
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
                <button className='db-image-btn' onClick={(e) => triggerImageUpload(e, note.id)} data-tooltip-text='Add Image'>
                    <i className="fa-regular fa-image"></i>
                </button>
                <button className='db-archive-btn' onClick={(e) => {e.stopPropagation(); handleArchive(note.id);}} data-tooltip-text='Archive Note'>
                    <i className="fa-solid fa-box-archive"></i>
                </button>
                <button className="db-delete-btn" onClick={(e) => {e.stopPropagation(); handleTrash(note.id);}} data-tooltip-text='Move to Trash'>
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    );

    return (
        <div className ='dashboard-body'>
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleImageSelect}
            />
            {loading ? (
                <div className="db-loading-screen">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
            ) : (
                <>
                    {pinnedNotes.length > 0 && (
                        <>
                            <div className="db-section-label">PINNED</div>
                            <div className={`db-grid ${isGridView ? '' : 'list-view'}`}>
                                {pinnedNotes.map(note => renderNoteCard(note))}
                            </div>
                        </>
                    )}
                    {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                        <div className="db-section-label">OTHERS</div>
                    )}
                    <div className={`db-grid ${isGridView ? '' : 'list-view'}`}>
                        {otherNotes.map(note => renderNoteCard(note))}
                    </div>
                    {!loading && notes.length === 0 && (
                        <div className="db-empty-state">
                            <i className="fa-regular fa-lightbulb"></i>
                            <p>Your notes will appear here</p>
                        </div>
                    )}
                </>
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