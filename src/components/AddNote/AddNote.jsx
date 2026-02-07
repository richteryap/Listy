import { useState, useRef, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useClickOutside } from '../../hooks/useClickOutside';
import { convertToBase64, validateImage } from '../../utils/fileUtils.js';
import { useSnackbar } from '../context/SnackbarContext.jsx';
import { useNoteContent } from '../../hooks/useNoteContent.js';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea.js';
import './AddNote.css';

const AddNote = ({ onClose }) => {
    const [user] = useAuthState(auth);
    const [title, setTitle] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const { 
        isList, setIsList, content, setContent, listItems, setListItems,
        toggleMode, updateListItem, toggleCheckbox, addListItem, removeListItem, handleListKeyDown
    } = useNoteContent();

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

    const addNoteRef = useClickOutside(async () => {
        await handleAddNote();
        onClose();
    });

    const handleAddNote = async (e) => {
        if (e) e.preventDefault();

        const isListEmpty = isList && listItems.every(i => i.text.trim() === '');
        const isTextEmpty = !isList && !content.trim();
        if (!title.trim() && isTextEmpty && isListEmpty && !imageFile) return;
    
        try {
            const newNoteRef = await addDoc(collection(db, 'notes'), {
                title: title,
                content: content,
                isList: isList,
                listItems: listItems,
                imageUrl: imageFile,
                userId: user.uid,
                isTrashed: false,
                isArchived: isArchived,
                isPinned: isPinned,
                createdAt: serverTimestamp()
            });

            const message = isArchived ? "Note archived" : "Note created";

            showSnackbar(message, async () => {
                await deleteDoc(doc(db, 'notes', newNoteRef.id));
                showSnackbar("Note deleted", null); 
            });

            setTitle('');
            setContent('');
            setListItems([]);
            setIsList(false);
            setImageFile(null);
            setIsPinned(false);
            setIsArchived(false);
        } catch (error) {
            console.error("Error adding note: ", error);
        }
    };

    const handleClose = async () => {
        await handleAddNote();
        onClose();
    };

    return (
        <div className="add-note-overlay">
            <div className="add-note-container" ref={addNoteRef}>
                {imageFile && (
                    <div className="an-image-preview">
                        <img src={imageFile} alt="Preview" />
                        <button onClick={() => setImageFile(null)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}
                <div className='an-text-area'>
                    <input type='text' className='an-title' placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)} autoFocus/>
                    {isList ? (
                        <div className="an-list-container">
                            {listItems.map((item, index) => (
                                <div key={item.id} className="an-list-item">
                                    <input type="checkbox" checked={item.isChecked} onChange={() => toggleCheckbox(item.id)}/>
                                    <input type="text" value={item.text} onChange={(e) => updateListItem(item.id, e.target.value)} onKeyDown={(e) => handleListKeyDown(e, index, item.id)} autoFocus/>
                                    <button onClick={() => removeListItem(item.id)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            ))}
                            <div className="an-list-add" onClick={() => addListItem()}>
                                <i className="fa-solid fa-plus"></i> List Item
                            </div>
                        </div>
                    ) : (
                        <textarea className='an-content' placeholder='Take a note...' value={content} onChange={(e) => {setContent(e.target.value)}} ref={textareaRef} rows={1}/>
                    )}
                </div>
                <div className='an-footer'>
                    <div className='an-footer-buttons'>
                        <button className={`an-pin-btn ${isPinned ? 'active' : ''}`} onClick={() => setIsPinned(!isPinned)} data-tooltip-text={isPinned ? 'Unpin Note' : 'Pin Note'}>
                            <i className="fa-solid fa-thumbtack"></i>
                        </button>
                        <button className={`an-checkbox-btn ${isList ? 'active' : ''}`} onClick={toggleMode} data-tooltip-text='Show Tick Boxes'>
                            <i className="fa-solid fa-check-square"></i>
                        </button>
                        <button className='an-image-btn' onClick={() => fileInputRef.current.click()} data-tooltip-text='Add Image'>
                            <i className="fa-regular fa-image"></i>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleImageSelect}
                        />
                        <button className={`an-archive-btn ${isArchived ? 'active' : ''}`} onClick={() => setIsArchived(!isArchived)} data-tooltip-text='Archive Note'>
                            <i className="fa-solid fa-box-archive"></i>
                        </button>
                        <button className='an-undo-btn' data-tooltip-text='Undo'>
                            <i className="fa-solid fa-rotate-left"></i>
                        </button>
                        <button className='an-redo-btn' data-tooltip-text='Redo'>
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                    </div>
                    <button className='an-close-btn' onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddNote;