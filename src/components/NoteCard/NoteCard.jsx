import './NoteCard.css';

const NoteCard = ({ note, onEdit, onPin, onArchive, onUnarchive, onTrash, onToggleMode, onImageUpload, onRestore, onDelete }) => {
    const isTrashed = note.isTrashed;
    const isArchived = note.isArchived;

    const getDaysLeft = (trashedAt) => {
        if (!trashedAt) return 30;

        const trashDate = new Date(trashedAt); 
        const now = new Date();
        
        const diffInMs = now - trashDate;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        const daysLeft = 30 - diffInDays;
        return daysLeft > 0 ? daysLeft : 0;
    };

    const imageUrl = note.imageUrl instanceof File 
        ? URL.createObjectURL(note.imageUrl) 
        : note.imageUrl;

    return (
        <div className={`note-card ${isTrashed ? 'trashed' : ''}`}>
            <div className="note-card-content" onClick={() => !isTrashed && onEdit(note)}>
                {note.imageUrl && (
                    <div className="note-card-image">
                        <img src={imageUrl} alt="Note Attachment" />
                    </div>
                )}

                {note.title && <h1>{note.title}</h1>}

                {note.isList ? (
                    <div className="note-card-list-preview">
                        {note.listItems?.slice(0, 4).map(item => (
                            <div key={item.id} className="note-card-list-item-preview">
                                <i className={`fa-regular ${item.isChecked ? 'fa-square-check' : 'fa-square'}`}></i>
                                <span className={item.isChecked ? 'checked' : ''}>{item.text}</span>
                            </div>
                        ))}
                        {note.listItems?.length > 4 && (
                            <div className="note-card-list-more">
                                + {note.listItems.length - 4} more items
                            </div>
                        )}
                    </div>
                ) : (
                    <p>{note.content}</p>
                )}
            </div>

            <div className={`note-card-buttons ${isTrashed ? 'trashed-buttons' : ''}`}>
                {!isTrashed ? (
                    <>
                        <button className={`note-card-pin-btn ${note.isPinned ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onPin(note); }} data-tooltip-text={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                            <i className="fa-solid fa-thumbtack"></i>
                        </button>
                        <button className='note-card-checkbox-btn'
                            onClick={(e) => { e.stopPropagation(); onToggleMode(note); }} data-tooltip-text={note.isList ? 'Show Text' : 'Show Tick Boxes'}>
                            <i className="fa-solid fa-check-square"></i>
                        </button>
                        <button className='note-card-image-btn'
                            onClick={(e) => onImageUpload(e, note.id)} data-tooltip-text='Add Image'>
                            <i className="fa-regular fa-image"></i>
                        </button>
                        {!isArchived ? (
                            <button className={`note-card-archive-btn ${note.isArchived ? 'active' : ''}`}
                                onClick={(e) => {e.stopPropagation(); onArchive(note);}} data-tooltip-text={note.isArchived ? 'Unarchive' : 'Archive'}>
                                <i className="fa-solid fa-box-archive"></i>
                            </button>
                        ) : (
                            <button className='note-card-unarchive-btn'
                                onClick={(e) => {e.stopPropagation(); onUnarchive(note);}} data-tooltip-text='Unarchive Note'>
                                <i className="fa-solid fa-box-open"></i>
                            </button>
                        )}
                        <button className="note-card-delete-btn"
                            onClick={(e) => {e.stopPropagation(); onTrash(note);}} data-tooltip-text='Move to Trash'>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </>
                ) : (
                    <>
                        <button className='note-card-restore-btn trash-btn'
                            onClick={(e) => {e.stopPropagation(); onRestore(note.id);}} data-tooltip-text='Restore Note'>
                            <i className="fa-solid fa-trash-arrow-up"></i>
                        </button>
                        <button className='note-card-deleteforever-btn trash-btn'
                            onClick={(e) => {e.stopPropagation(); onDelete(note.id);}} data-tooltip-text='Delete Forever'>
                            <i className="fa-solid fa-ban"></i>
                        </button>
                        <div className="note-card-days-left">
                            {getDaysLeft(note.trashedAt)} days left
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NoteCard;