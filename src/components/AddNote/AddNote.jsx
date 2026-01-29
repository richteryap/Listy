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
        <div className="modal-overlay">
            <div className="add-note-modal" ref={addNoteRef}>
                <input
                    type='text'
                    className='note-title-input'
                    placeholder='Title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                />
                <textarea
                    className='note-content-input'
                    placeholder='Take a note...'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                />
                <div className='add-note-footer'>
                    <button className='close-note-btn' onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddNote;