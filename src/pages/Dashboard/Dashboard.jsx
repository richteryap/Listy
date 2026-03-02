import { useState, useRef } from 'react';
import { db } from '../../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import { convertToBase64, validateImage } from '../../utils/fileUtils.js';
import { useNoteActions } from '../../hooks/useNoteActions.js';
import { useNotes } from '../../hooks/useNotes.js';
import EditNote from '../../components/EditNote/EditNote.jsx';
import './Dashboard.css';   

const Dashboard = ({ isGridView, searchQuery }) => {
    const [selectedNote, setSelectedNote] = useState(null);
    const [animate, setAnimate] = useState(null);
    const [activeNoteId, setActiveNoteId] = useState(null);

    const fileInputRef = useRef(null);

    const { notes, loading } = useNotes('dashboard');
    const { toggleNoteListMode, dbTogglePin, archiveNote, dbTrashNote } = useNoteActions();

    const filteredNotes = notes.filter(note => {
        const query = searchQuery.toLowerCase();
        const titleMatch = note.title?.toLowerCase().includes(query);
        const contentMatch = note.content?.toLowerCase().includes(query);
        const listMatch = note.isList && note.listItems?.some(item => item.text.toLowerCase().includes(query));
        return titleMatch || contentMatch || listMatch;
    });

    const pinnedNotes = filteredNotes.filter(note => note.isPinned);
    const otherNotes = filteredNotes.filter(note => !note.isPinned);

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

    const renderNoteCard = (note) => (
        <div key={note.id} className={`db-note-card ${selectedNote?.id === note.id || animate === note.id ? 'selected' : ''}`}>
            <div className="db-note-content" onClick={(e) => {e.stopPropagation(); handleAnimate(note);}}>
                {note.imageUrl && (
                    <div className="db-note-image">
                        <img src={note.imageUrl} alt="Note Attachment" />
                    </div>
                )}
                {note.title && <h1>{note.title}</h1>}
                {note.isList ? (
                    <div className="db-note-list-preview">
                        {note.listItems && note.listItems.slice(0, 4).map(item => (
                            <div key={item.id} className="db-list-item-preview">
                                <i className={`fa-regular ${item.isChecked ? 'fa-square-check' : 'fa-square'}`}></i>
                                <span className={item.isChecked ? 'checked' : ''}>{item.text}</span>
                            </div>
                        ))}
                        {note.listItems && note.listItems.length > 4 && (
                            <div className="db-list-more">
                                + {note.listItems.length - 4} more items
                            </div>
                        )}
                    </div>
                ) : (
                    <p>{note.content}</p>
                )}
            </div>
            <div className="db-note-buttons">
                <button className={`db-pin-btn ${note.isPinned ? 'active' : ''}`} onClick={(e) => {e.stopPropagation(); dbTogglePin(note.id, note.isPinned);}} data-tooltip-text={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                    <i className="fa-solid fa-thumbtack"></i>
                </button>
                <button className='db-checkbox-btn' onClick={(e) => {e.stopPropagation(); toggleNoteListMode(note);}} data-tooltip-text={note.isList ? 'Show Text' : 'Show Tick Boxes'}>
                    <i className="fa-solid fa-check-square"></i>
                </button>
                <button className='db-image-btn' onClick={(e) => triggerImageUpload(e, note.id)} data-tooltip-text='Add Image'>
                    <i className="fa-regular fa-image"></i>
                </button>
                <button className={`db-archive-btn ${note.isArchived ? 'active' : ''}`} onClick={(e) => {e.stopPropagation(); archiveNote(note.id);}} data-tooltip-text={note.isArchived ? 'Unarchive' : 'Archive'}>
                    <i className="fa-solid fa-box-archive"></i>
                </button>
                <button className="db-delete-btn" onClick={(e) => {e.stopPropagation(); dbTrashNote(note.id);}} data-tooltip-text='Moved to Trash'>
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