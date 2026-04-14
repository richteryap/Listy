import { useState, useRef } from 'react';
import { validateImage } from '../../utils/fileUtils.js';
import { useNoteActions } from '../../hooks/useNoteActions.js';
import { useNotes } from '../../hooks/useNotes.js';
import NoteEditor from '../../components/NoteEditor/NoteEditor.jsx';
import NoteCard from '../../components/NoteCard/NoteCard.jsx';
import './Archive.css';

const Archive = ({ isGridView, searchQuery }) => {
    const [selectedNote, setSelectedNote] = useState(null);
    const [animate, setAnimate] = useState(null);
    const [activeNoteId, setActiveNoteId] = useState(null);

    const fileInputRef = useRef(null);

    const { notes, loading } = useNotes('archive');

    const { 
        uploadImageToCloud, toggleNoteListMode, archiveTogglePin,
        unarchiveNote, archiveTrashNote, updateNoteImage 
    } = useNoteActions();

    const filteredNotes = notes.filter(note => 
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.isList && note.listItems?.some(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
            return; 
        }

        try {
            const imageUrl = await uploadImageToCloud(file, activeNoteId);
            
            await updateNoteImage(activeNoteId, imageUrl);
            
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            e.target.value = null;
            if (setActiveNoteId) setActiveNoteId(null);
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
                    {filteredNotes.map(note => (
                        <NoteCard
                            key={note.id} 
                            note={note} 
                            onEdit={handleAnimate}
                            onPin={() => archiveTogglePin(note.id, note.isPinned)}
                            onUnarchive={() => unarchiveNote(note.id)}
                            onTrash={() => archiveTrashNote(note.id)}
                            onToggleMode={toggleNoteListMode}
                            onImageUpload={triggerImageUpload}
                        />
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
                <NoteEditor 
                    note={selectedNote}
                    onClose={() => setSelectedNote(null)}
                />
            )}
        </div>
    );
};

export default Archive;