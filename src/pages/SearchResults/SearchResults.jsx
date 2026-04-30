import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotes } from '../../hooks/useNotes';
import { useNoteActions } from '../../hooks/useNoteActions';
import { validateImage } from '../../utils/fileUtils';
import NoteEditor from '../../components/NoteEditor/NoteEditor.jsx';
import NoteCard from '../../components/NoteCard/NoteCard.jsx';
import './SearchResults.css';

const SearchResults = ({ isGridView }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [selectedNote, setSelectedNote] = useState(null);
    const [animate, setAnimate] = useState(null);
    const [activeNoteId, setActiveNoteId] = useState(null);

    const { notes, loading } = useNotes('search');

    const {
        uploadImageToCloud, dbTogglePin, archiveNote, unarchiveNote,
        dbTrashNote, toggleNoteListMode, updateNoteImage
    } = useNoteActions();

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
            if (setActiveNoteId) setActiveNoteId(null);
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

    const dashboardNotes = filteredNotes.filter(note => !note.isArchived);
    const archivedNotes = filteredNotes.filter(note => note.isArchived);

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
                <>
                    {dashboardNotes.length > 0 && (
                        <>
                            <div className={`sr-grid ${isGridView ? '' : 'list-view'}`}>
                                {dashboardNotes.map(note => (
                                    <div key={note.id} className={selectedNote?.id === note.id || animate === note.id ? 'selected' : ''}>
                                        <NoteCard
                                            note={note}
                                            onEdit={handleAnimate}
                                            onPin={() => dbTogglePin(note.id, note.isPinned)}
                                            onArchive={() => archiveNote(note.id)}
                                            onUnarchive={() => unarchiveNote(note.id)}
                                            onTrash={() => dbTrashNote(note.id)}
                                            onToggleMode={toggleNoteListMode}
                                            onImageUpload={triggerImageUpload}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {archivedNotes.length > 0 && (
                        <div className="sr-section-label">ARCHIVED</div>
                    )}
                    {archivedNotes.length > 0 && (
                        <div className={`sr-grid ${isGridView ? '' : 'list-view'}`}>
                            {archivedNotes.map(note => (
                                <div key={note.id} className={selectedNote?.id === note.id || animate === note.id ? 'selected' : ''}>
                                    <NoteCard
                                        note={note}
                                        onEdit={handleAnimate}
                                        onPin={() => dbTogglePin(note.id, note.isPinned)}
                                        onArchive={() => archiveNote(note.id)}
                                        onUnarchive={() => unarchiveNote(note.id)}
                                        onTrash={() => dbTrashNote(note.id)}
                                        onToggleMode={toggleNoteListMode}
                                        onImageUpload={triggerImageUpload}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && filteredNotes.length === 0 &&
                        <div className="sr-empty-state">
                            <i className="fa-regular fa-lightbulb"></i>
                            <p>No matching results</p>
                        </div>
                    }
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

export default SearchResults;