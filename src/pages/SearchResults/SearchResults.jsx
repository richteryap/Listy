import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotes } from '../../hooks/useNotes';
import { useNoteActions } from '../../hooks/useNoteActions';
import { convertToBase64, validateImage } from '../../utils/fileUtils';
import NoteEditor from '../../components/NoteEditor/NoteEditor.jsx';
import './SearchResults.css';

const SearchResults = ({ searchQuery, isGridView }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [selectedNote, setSelectedNote] = useState(null);
    const [animate, setAnimate] = useState(null);
    const [activeNoteId, setActiveNoteId] = useState(null);

    const { notes, loading } = useNotes('search');
    const { dbTogglePin, archiveNote, unarchiveNote, dbTrashNote, toggleNoteListMode } = useNoteActions();

    const fileInputRef = useRef(null);

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
            
            const noteRef = doc(sr, "notes", activeNoteId);
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

    const safeQuery = query.toLowerCase();

    const filteredNotes = notes.filter(note => {
        const titleMatch = note.title
            ? note.title.toLowerCase().includes(safeQuery)
            : false;

        const contentMatch = note.content
            ? note.content.toLowerCase().includes(safeQuery)
            : false;

        const listMatch = note.isList && note.listItems
            ? note.listItems.some(item => (item.text || '').toLowerCase().includes(safeQuery))
            : false;
        
        return titleMatch || contentMatch || listMatch;
    });

    return (
        <div className="search-results-body">
            <div className="sr-section-label">SEARCH RESULTS</div>
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleImageSelect}
            />
            {loading ? (
                <div className="sr-loading-screen">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
            ) : (
                <div className={`sr-grid ${isGridView ? '' : 'list-view'}`}>
                    {filteredNotes.map(note => (
                        <div key={note.id} className={`sr-note-card ${selectedNote?.id === note.id || animate === note.id ? 'selected' : ''}`}>
                            <div className="sr-note-content" onClick={(e) => {e.stopPropagation(); handleAnimate(note);}}>
                                {note.imageUrl && (
                                    <div className="sr-note-image">
                                        <img src={note.imageUrl} alt="Note Attachment" />
                                    </div>
                                )}
                                {note.title && <h1>{note.title}</h1>}
                                {note.isList ? (
                                    <div className="sr-note-list-preview">
                                        {note.listItems && note.listItems.slice(0, 4).map(item => (
                                            <div key={item.id} className="sr-list-item-preview">
                                                <i className={`fa-regular ${item.isChecked ? 'fa-square-check' : 'fa-square'}`}></i>
                                                <span className={item.isChecked ? 'checked' : ''}>{item.text}</span>
                                            </div>
                                        ))}
                                        {note.listItems && note.listItems.length > 4 && (
                                            <div className="sr-list-more">
                                                + {note.listItems.length - 4} more items
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p>{note.content}</p>
                                )}
                            </div>
                            <div className="sr-note-buttons">
                                <button className={`sr-pin-btn ${note.isPinned ? 'active' : ''}`} onClick={(e) => {e.stopPropagation(); dbTogglePin(note.id, note.isPinned);}} data-tooltip-text={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                                    <i className="fa-solid fa-thumbtack"></i>
                                </button>
                                <button className='sr-checkbox-btn' onClick={(e) => {e.stopPropagation(); toggleNoteListMode(note);}} data-tooltip-text={note.isList ? 'Show Text' : 'Show Tick Boxes'}>
                                    <i className="fa-solid fa-check-square"></i>
                                </button>
                                <button className='sr-image-btn' onClick={(e) => triggerImageUpload(e, note.id)} data-tooltip-text='Add Image'>
                                    <i className="fa-regular fa-image"></i>
                                </button>
                                <button 
                                    className='sr-archive-btn'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (note.isArchived) {
                                            unarchiveNote(note.id);
                                        } else {
                                            archiveNote(note.id);
                                        }
                                    }}
                                    data-tooltip-text={note.isArchived ? 'Unarchive' : 'Archive Note'}
                                >
                                    <i className={`fa-solid ${note.isArchived ? 'fa-box-open' : 'fa-box-archive'}`}></i>
                                </button>
                                <button className="sr-delete-btn" onClick={(e) => {e.stopPropagation(); dbTrashNote(note.id);}} data-tooltip-text='Moved to Trash'>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && notes.length === 0 &&
                        <div className="sr-empty-state">
                            <i className="fa-regular fa-lightbulb"></i>
                            <p>No matching results</p>
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
    )
}

export default SearchResults;