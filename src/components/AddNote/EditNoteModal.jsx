import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useClickOutside } from '../../hooks/useClickOutside';
import './EditNoteModal.css'; // We'll create this next

const EditNoteModal = ({ note, onClose }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);

    // Close and Auto-Save when clicking outside the modal content
    const modalRef = useClickOutside(async () => {
        await handleSave();
        onClose();
    });

    const handleSave = async () => {
        // Only update if content actually changed
        if (title === note.title && content === note.content) return;

        try {
            const noteRef = doc(db, "notes", note.id);
            await updateDoc(noteRef, {
                title: title,
                content: content,
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
        <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
                <input 
                    type="text"
                    className="modal-title" 
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea 
                    className="modal-body"
                    placeholder="Note"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="modal-footer">
                    <button className="close-btn" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditNoteModal;