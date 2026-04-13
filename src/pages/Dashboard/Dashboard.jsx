import { useState, useRef } from 'react';
import { convertToBase64, validateImage } from '../../utils/fileUtils.js';
import { useNoteActions } from '../../hooks/useNoteActions.js';
import { useNotes } from '../../hooks/useNotes.js';
import NoteEditor from '../../components/NoteEditor/NoteEditor.jsx';
import NoteCard from '../../components/NoteCard/NoteCard.jsx';
import './Dashboard.css';   

const Dashboard = ({ isGridView, searchQuery }) => {
    const [selectedNote, setSelectedNote] = useState(null);
    const [animate, setAnimate] = useState(null);
    const [activeNoteId, setActiveNoteId] = useState(null);

    const fileInputRef = useRef(null);

    const { notes, loading } = useNotes('dashboard');
    const { toggleNoteListMode, dbTogglePin, archiveNote, dbTrashNote, updateNoteImage } = useNoteActions();

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
            await updateNoteImage(activeNoteId, base64);

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
                                {pinnedNotes.map(note => (
                                    <NoteCard
                                        key={note.id} 
                                        note={note} 
                                        onEdit={handleAnimate}
                                        onPin={() => dbTogglePin(note.id, note.isPinned)}
                                        onArchive={() => archiveNote(note.id)}
                                        onTrash={() => dbTrashNote(note.id)}
                                        onToggleMode={toggleNoteListMode}
                                        onImageUpload={triggerImageUpload}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                        <div className="db-section-label">OTHERS</div>
                    )}
                    <div className={`db-grid ${isGridView ? '' : 'list-view'}`}>
                        {otherNotes.map(note => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onEdit={handleAnimate}
                                onPin={() => dbTogglePin(note.id, note.isPinned)}
                                onArchive={() => archiveNote(note.id)}
                                onTrash={() => dbTrashNote(note.id)}
                                onToggleMode={toggleNoteListMode}
                                onImageUpload={triggerImageUpload}
                            />
                        ))}
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
                <NoteEditor
                    note={selectedNote} 
                    onClose={() => setSelectedNote(null)} 
                />
            )}
        </div>
    )
}

export default Dashboard;