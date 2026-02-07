import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useClickOutside } from '../../hooks/useClickOutside';
import { convertToBase64, validateImage } from '../../utils/fileUtils.js';
import { useSnackbar } from '../context/SnackbarContext.jsx';
import './EditNote.css';

const EditNote = ({ note, onClose }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [isPinned, setIsPinned] = useState(note.isPinned || false); 
    const [isTrashed, setIsTrashed] = useState(note.isTrashed || false);
    const [isArchived, setIsArchived] = useState(note.isArchived || false);
    const [imageFile, setImageFile] = useState(note.imageUrl || null);
    
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const { showSnackbar } = useSnackbar();

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        
        if (!validateImage(file)) {
            e.target.value = null;
            return; 
        }

        try {
            const base64 = await convertToBase64(file);
            setImageFile(base64);
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            e.target.value = null;
        }
    };

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
        const newStatus = !isArchived;

        try {
            const noteRef = doc(db, "notes", note.id);
            
            await updateDoc(noteRef, {
                title: title,
                content: content,
                imageUrl: imageFile,
                isArchived: newStatus,
                isPinned: false,
                updatedAt: serverTimestamp()
            });

            const message = newStatus ? "Note archived" : "Note unarchived";

            const undoAction = async () => {
                await updateDoc(noteRef, {
                    isArchived: !newStatus,
                });
            };

            showSnackbar(message, undoAction);
            onClose();
        } catch (error) {
            console.error("Error archiving note:", error);
        }
    };

    const handleTrashNow = async () => {
        const newStatus = !isTrashed;
        try {
            const noteRef = doc(db, "notes", note.id);
            await updateDoc(noteRef, {
                title: title,
                content: content,
                imageUrl: imageFile,
                isTrashed: newStatus,
                isPinned: isPinned,
                isArchived: isArchived,
                updatedAt: serverTimestamp()
            });
            const message = newStatus ? "Note moved to trash" : "Note untrashed";
            const undoAction = async () => {
                await updateDoc(noteRef, {
                    isTrashed: !newStatus,
                });
            };
            showSnackbar(message, undoAction);
            onClose();
        } catch (error) {
            console.error("Error trashing note:", error);
        }
    };

    const handleSave = async () => {
        if (
            title === note.title &&
            content === note.content &&
            imageFile === note.imageUrl &&
            isPinned === note.isPinned &&
            isTrashed === note.isTrashed &&
            isArchived === note.isArchived
        ) return;

        try {
            const noteRef = doc(db, "notes", note.id);
            await updateDoc(noteRef, {
                title: title,
                content: content,
                imageUrl: imageFile,
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
                    {imageFile && (
                        <div className="en-image-preview">
                            <img src={imageFile} alt="Preview" />
                            <button onClick={() => setImageFile(null)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    )}
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
                        <button className={`en-pin-btn ${isPinned ? 'active' : ''}`} onClick={() => setIsPinned(!isPinned)} data-tooltip-text={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                            <i className="fa-solid fa-thumbtack"></i>
                        </button>
                        <button className='en-checkbox-btn' data-tooltip-text='Show Tick Boxes'>
                            <i className="fa-solid fa-check-square"></i>
                        </button>
                        <button className='en-image-btn' onClick={() => fileInputRef.current.click()} data-tooltip-text='Add Image'>
                            <i className="fa-regular fa-image"></i>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleImageSelect}
                        />
                        <button className={`en-archive-btn ${isArchived ? 'active' : ''}`} onClick={handleArchiveNow} data-tooltip-text='Archive Note'>
                            <i className="fa-solid fa-box-archive"></i>
                        </button>
                        <button className={`en-delete-btn ${isTrashed ? 'active' : ''}`} onClick={handleTrashNow} data-tooltip-text='Move to Trash'>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                        <button className='en-undo-btn' data-tooltip-text='Undo'>
                            <i className="fa-solid fa-rotate-left"></i>
                        </button>
                        <button className='en-redo-btn' data-tooltip-text='Redo'>
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