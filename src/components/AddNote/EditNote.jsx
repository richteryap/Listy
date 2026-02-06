import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useClickOutside } from '../../hooks/useClickOutside';
import './EditNote.css';

const EditNote = ({ note, onClose }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [isPinned, setIsPinned] = useState(note.isPinned || false); 
    const [isTrashed, setIsTrashed] = useState(note.isTrashed || false);
    const [isArchived, setIsArchived] = useState(note.isArchived || false);
    
    const textareaRef = useRef(null);

    const handleInput = (e) => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
        setContent(e.target.value);
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [note])

    const editNoteRef = useClickOutside(async () => {
        await handleSave();
        onClose();
    });

    const handleArchiveNow = async () => {
        try {
            const newStatus = !isArchived;
            const noteRef = doc(db, "notes", note.id);
            
            await updateDoc(noteRef, {
                title: title,
                content: content,
                isArchived: newStatus,
                isPinned: false,
                updatedAt: serverTimestamp()
            });
            onClose();
        } catch (error) {
            console.error("Error archiving note:", error);
        }
    };

    const handleTrashNow = async () => {
        try {
            const newStatus = !isTrashed;
            const noteRef = doc(db, "notes", note.id);

            await updateDoc(noteRef, {
                title: title,
                content: content,
                isTrashed: newStatus,
                isPinned: isPinned,
                isArchived: isArchived,
                updatedAt: serverTimestamp()
            });
            onClose();
        } catch (error) {
            console.error("Error trashing note:", error);
        }
    };

    const handleSave = async () => {
        if (
            title === note.title &&
            content === note.content &&
            isPinned === note.isPinned &&
            isTrashed === note.isTrashed &&
            isArchived === note.isArchived
        ) return;

        try {
            const noteRef = doc(db, "notes", note.id);
            await updateDoc(noteRef, {
                title: title,
                content: content,
                isPinned: isPinned,
                isTrashed: isTrashed,
                isArchived: isArchived,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    const handleClose = async () => {
        await handleSave();
        onClose();
    };

    return (
        <div className="edit-note-overlay">
            <div className="edit-note-container" ref={editNoteRef}>
                <div className='en-text-area'>
                    <input 
                        type="text"
                        className="en-title" 
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                    <textarea 
                        className="en-content"
                        placeholder="Take a note..."
                        value={content}
                        onChange={(e) => {setContent(e.target.value); handleInput();}}
                        ref={textareaRef}
                        rows={1}
                    />
                </div>
                <div className="en-footer">
                    <div className='en-footer-buttons'>
                        <button className={`en-pin-btn ${isPinned ? 'active' : ''}`} onClick={() => setIsPinned(!isPinned)}>
                            <i className="fa-solid fa-thumbtack"></i>
                        </button>
                        <button className='en-checkbox-btn'>
                            <i className="fa-solid fa-check-square"></i>
                        </button>
                        <button className='en-image-btn'>
                            <i className="fa-regular fa-image"></i>
                        </button>
                        <button className={`en-archive-btn ${isArchived ? 'active' : ''}`} onClick={handleArchiveNow}>
                            <i className="fa-solid fa-box-archive"></i>
                        </button>
                        <button className={`en-delete-btn ${isTrashed ? 'active' : ''}`} onClick={handleTrashNow}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                        <button className='en-undo-btn'>
                            <i className="fa-solid fa-rotate-left"></i>
                        </button>
                        <button className='en-redo-btn'>
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                    </div>
                    <button className="en-close-btn" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditNote;