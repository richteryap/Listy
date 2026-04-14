import { useNoteActions } from '../../hooks/useNoteActions';
import { useNotes } from '../../hooks/useNotes';
import NoteCard from '../../components/NoteCard/NoteCard';
import './Trash.css';

const Trash = ({ isGridView }) => {
    const { notes, loading } = useNotes('trash');
    const {
        restoreNote, deleteNoteForever
    } = useNoteActions();

    return (
        <div className='trash-body'>
            {loading ? (
                <div className="trash-loading-screen">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
            ) : (
                <div className={`trash-grid ${isGridView ? '' : 'list-view'}`}>
                    {notes.map(note => (
                        <NoteCard
                        key={note.id}
                            note={note}
                            onRestore={restoreNote}
                            onDelete={deleteNoteForever}
                        />
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