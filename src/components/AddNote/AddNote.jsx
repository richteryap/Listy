import { useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useClickOutside } from '../../hooks/useClickOutside';
import './AddNote.css';

const AddNote = ({ onClose }) => {
    const [user] = useAuthState(auth);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const addNoteRef = useClickOutside(async () => {
        await handleAddNote();
        onClose();
    });

    const handleAddNote = async (e) => {
        if (e) e.preventDefault();
        
        if (!title.trim() && !content.trim()) return;
    
        try {
            await addDoc(collection(db, 'notes'), {
                title: title,
                content: content,
                userId: user.uid,
                createdAt: serverTimestamp()
            });
            setTitle('');
            setContent('');
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
                <div className='an-text-area'>
                    <input
                        type='text'
                        className='an-title'
                        placeholder='Title'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                    <textarea
                        className='an-content'
                        placeholder='Take a note...'
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
                    />
                </div>
                <div className='an-footer'>
                    <div className='an-footer-buttons'>
                        <button className='an-pin-btn'>
                            <i className="fa-solid fa-thumbtack"></i>
                        </button>
                        <button className='an-checkbox-btn'>
                            <i className="fa-solid fa-check-square"></i>
                        </button>
                        <button className='an-image-btn'>
                            <i className="fa-regular fa-image"></i>
                        </button>
                        <button className='an-tags-btn'>
                            <i className="fa-solid fa-tags"></i>
                        </button>
                        <button className='an-archive-btn'>
                            <i className="fa-solid fa-box-archive"></i>
                        </button>
                        <button className='an-undo-btn'>
                            <i className="fa-solid fa-rotate-left"></i>
                        </button>
                        <button className='an-redo-btn'>
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