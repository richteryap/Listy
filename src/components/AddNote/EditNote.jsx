import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useClickOutside } from '../../hooks/useClickOutside';
import { convertToBase64, validateImage } from '../../utils/fileUtils.js';
import { useSnackbar } from '../context/SnackbarContext.jsx';
import { useNoteContent } from '../../hooks/useNoteContent.js';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea.js';
import './EditNote.css';

const EditNote = ({ note, onClose }) => {
    const [title, setTitle] = useState(note.title);
    const [isPinned, setIsPinned] = useState(note.isPinned || false); 
    const [isTrashed, setIsTrashed] = useState(note.isTrashed || false);
    const [isArchived, setIsArchived] = useState(note.isArchived || false);
    const [imageFile, setImageFile] = useState(note.imageUrl || null);
    
    const { 
        isList, setIsList, content, setContent, listItems, setListItems,
        toggleMode, updateListItem, toggleCheckbox, addListItem, removeListItem, handleListKeyDown
    } = useNoteContent(note);

    const textareaRef = useAutoResizeTextArea(content, isList);
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

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

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
                isList: isList,
                listItems: listItems,
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
                isList: isList,
                listItems: listItems,
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
            JSON.stringify(listItems) === JSON.stringify(note.listItems) && 
            isList === note.isList &&
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
                isList: isList,
                listItems: listItems,
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
                {imageFile && (
                    <div className="en-image-preview">
                        <img src={imageFile} alt="Preview" />
                        <button onClick={() => setImageFile(null)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}
                <div className='en-text-area'>
                    <input type="text" className="en-title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus/>
                    {isList ? (
                        <div className="en-list-container">
                            {listItems.map((item, index) => (
                                <div key={item.id} className="en-list-item">
                                    <input type="checkbox" checked={item.isChecked} onChange={() => toggleCheckbox(item.id)}/>
                                    <input type="text" value={item.text} onChange={(e) => updateListItem(item.id, e.target.value)} onKeyDown={(e) => handleListKeyDown(e, index, item.id)} autoFocus/>
                                    <button onClick={() => removeListItem(item.id)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            ))}
                            <div className="en-list-add" onClick={() => addListItem()}>
                                <i className="fa-solid fa-plus"></i> List Item
                            </div>
                        </div>
                    ) : (
                        <textarea className="en-content" placeholder="Take a note..." value={content} onChange={(e) => {setContent(e.target.value)}} ref={textareaRef} rows={1}/>
                    )}
                </div>
                <div className="en-footer">
                    <div className='en-footer-buttons'>
                        <button className={`en-pin-btn ${isPinned ? 'active' : ''}`} onClick={() => setIsPinned(!isPinned)} data-tooltip-text={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                            <i className="fa-solid fa-thumbtack"></i>
                        </button>
                        <button className={`en-checkbox-btn ${isList ? 'active' : ''} `} onClick={toggleMode} data-tooltip-text='Show Tick Boxes'>
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