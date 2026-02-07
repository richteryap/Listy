import { useState, useRef } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { convertToBase64, validateImage } from '../../utils/fileUtils.js';
import { useNoteActions } from '../../hooks/useNoteActions.js';
import { useNotes } from '../../hooks/useNotes.js';
import EditNote from '../AddNote/EditNote.jsx';
import './Archive.css';

const Archive = ({ isGridView }) => {
    const [selectedNote, setSelectedNote] = useState(null);
    const [animate, setAnimate] = useState(null);
    const [activeNoteId, setActiveNoteId] = useState(null);

    const fileInputRef = useRef(null);

    const { notes, loading } = useNotes('archive');
    const { archiveTogglePin, unarchiveNote, archiveTrashNote } = useNoteActions();

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
        
        if (!validateImage(file)) { 
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

    const handleAnimate = (note) => {
        setAnimate(note.id);

        setTimeout(() => {
            setSelectedNote(note);
            setAnimate(null);
        }, 100);
    }

    return (
        <div className='archive-body'>
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleImageSelect}
            />
            {loading ? (
                <div className="archive-loading-screen">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
            ) : (
                <div className={`archive-grid ${isGridView ? '' : 'list-view'}`}>
                    {notes.map(note => (
                        <div key={note.id} className={`archive-note-card ${selectedNote?.id === note.id || animate === note.id ? 'selected' : ''}`}>
                            <div className="archive-note-content" onClick={(e) => {e.stopPropagation(); handleAnimate(note);}}>
                                {note.imageUrl && (
                                    <div className="db-note-image">
                                        <img src={note.imageUrl} alt="Note Attachment" />
                                    </div>
                                )}
                                {note.title && <h1>{note.title}</h1>}
                                <p>{note.content}</p>
                            </div>
                            <div className="archive-note-buttons">
                                <button className={`archive-pin-btn ${note.isPinned ? 'active' : ''}`} onClick={(e) => {e.stopPropagation(); archiveTogglePin(note.id, note.isPinned);}} data-tooltip-text={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                                    <i className="fa-solid fa-thumbtack"></i>
                                </button>
                                <button className='archive-checkbox-btn' onClick={(e) => {e.stopPropagation();}} data-tooltip-text='Show Tick Boxes'>
                                    <i className="fa-solid fa-check-square"></i>
                                </button>
                                <button className='archive-image-btn' onClick={(e) => triggerImageUpload(e, note.id)} data-tooltip-text='Add Image'>
                                    <i className="fa-regular fa-image"></i>
                                </button>
                                <button className='archive-unarchive-btn' onClick={(e) => {e.stopPropagation(); unarchiveNote(note.id);}} data-tooltip-text='Unarchive Note'>
                                    <i className="fa-solid fa-box-open"></i>
                                </button>
                                <button className='archive-delete-btn' onClick={(e) => {e.stopPropagation(); archiveTrashNote(note.id);}} data-tooltip-text='Move to Trash'>
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