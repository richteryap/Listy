import { useState } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import './Tags.css';

const Tags = ({ note, onClose }) => {
    const [input, setInput] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = input.trim();
            
            if (tag && !note.tags?.includes(tag)) {
                const noteRef = doc(db, 'notes', note.id);
                await updateDoc(noteRef, {
                    tags: arrayUnion(tag)
                });
                setInput('');
            }
        }
    };

    const removeTag = async (tagToRemove) => {
        const noteRef = doc(db, 'notes', note.id);
        await updateDoc(noteRef, {
            tags: arrayRemove(tagToRemove)
        });
    };

    const startEditing = (index, currentTag) => {
        setEditIndex(index);
        setEditValue(currentTag);
    };

    const saveEdit = async (index) => {
        if (!editValue.trim()) {
            setEditIndex(null);
            return;
        }

        // 1. Create a copy of the tags array
        const newTags = [...(note.tags || [])];
        
        // 2. Update the specific tag
        newTags[index] = editValue.trim();

        // 3. Update Firebase
        const noteRef = doc(db, 'notes', note.id);
        await updateDoc(noteRef, { tags: newTags });

        // 4. Close edit mode
        setEditIndex(null);
    };

    const handleEditKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            saveEdit(index);
        }
    };

    return (
        <div className="tag-modal-overlay" onClick={onClose}>
            <div className="tag-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="tag-header">
                    <h3>Tags</h3>
                    <button onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div className="tag-list">
                    {note.tags?.map((tag, index) => (
                        <span key={index} className="tag-item">
                            {editIndex === index ? (
                                <input 
                                    className="tag-edit-input"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => saveEdit(index)}
                                    onKeyDown={(e) => handleEditKeyDown(e, index)}
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <span className="tag-text">{tag}</span>
                                    <div className="tag-actions">
                                        <i 
                                            className="fa-solid fa-pen tag-icon edit" 
                                            onClick={() => startEditing(index, tag)}
                                            title="Rename"
                                        ></i>
                                        <i 
                                            className="fa-solid fa-xmark tag-icon delete" 
                                            onClick={() => removeTag(tag)}
                                            title="Remove"
                                        ></i>
                                    </div>
                                </>
                            )}
                        </span>
                    ))}
                </div>

                <input 
                    type="text" 
                    placeholder="Type a tag and press Enter..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus={editIndex === null}
                />
            </div>
        </div>
    );
};

export default Tags;