import { useNoteActions } from '../../hooks/useNoteActions';
import { useNotes } from '../../hooks/useNotes';
import './Trash.css';

const Trash = ({ isGridView }) => {
    const { notes, loading } = useNotes('trash');
    const { restoreNote, deleteNoteForever } = useNoteActions();

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
                                {note.imageUrl && (
                                    <div className="db-note-image">
                                        <img src={note.imageUrl} alt="Note Attachment" />
                                    </div>
                                )}
                                {note.title && <h1>{note.title}</h1>}
                                <p>{note.content}</p>
                            </div>
                            <div className="trash-note-buttons">
                                <button className='trash-restore-btn' onClick={() => restoreNote(note.id)} data-tooltip-text='Restore Note'>
                                    <i className="fa-solid fa-trash-arrow-up"></i>
                                </button>
                                <button className='trash-delete-btn' onClick={() => deleteNoteForever(note.id)} data-tooltip-text='Delete Forever'>
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