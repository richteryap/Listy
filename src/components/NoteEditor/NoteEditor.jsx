import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { validateImage } from '../../utils/fileUtils.js';
import { useSnackbar } from '../SnackbarContext.jsx';
import { useNoteContent } from '../../hooks/useNoteContent.js';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea.js';
import { useNoteActions } from '../../hooks/useNoteActions.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../db.js';
import './NoteEditor.css';

const NoteEditor = ({ note, onClose }) => {
    const { user } = useAuth();
    const isEditMode = !!note;

    const [title, setTitle] = useState(note?.title || '');
    const [isPinned, setIsPinned] = useState(note?.isPinned || false);
    const [isArchived, setIsArchived] = useState(note?.isArchived || false);
    const [isTrashed, setIsTrashed] = useState(note?.isTrashed || false);
    const [imageFile, setImageFile] = useState(note?.imageUrl || null);
    const [activeNoteId, setActiveNoteId] = useState(note?.id || crypto.randomUUID());

    const {
        uploadImageToCloud, updateNoteImage
    } = useNoteActions();

    const {
        isList, content, setContent, listItems, toggleMode, updateListItem,
        toggleCheckbox, addListItem, removeListItem, handleListKeyDown
    } = useNoteContent(note);

    const textareaRef = useAutoResizeTextArea(content, isList);
    const fileInputRef = useRef(null);
    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];

        if (!validateImage(file)) {
            e.target.value = null;
            return;
        }

        try {
            const imageUrl = await uploadImageToCloud(file, activeNoteId);

            await updateNoteImage(activeNoteId, imageUrl);

        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            e.target.value = null;
            if (setActiveNoteId) setActiveNoteId(null);
        }
    };

    const handleSave = async () => {
        if (!user) {
            console.error("Cannot save note: No authenticated user found.");
            return;
        }

        const hasTitle = title.trim().length > 0;
        const hasImage = imageFile !== null;
        const hasListContent = isList && listItems.some(item => item.text.trim().length > 0);
        const hasTextContent = !isList && content.trim().length > 0;

        if (!hasTitle && !hasListContent && !hasTextContent && !hasImage) return;

        const noteData = {
            user_id: user.id,
            title,
            content,
            isList,
            listItems,
            imageUrl: imageFile,
            isPinned,
            isArchived,
            isTrashed,
            updatedAt: new Date().toISOString()
        };

        try {
            if (isEditMode) {
                await db.notes.update(note.id, { ...noteData, sync_status: 'pending' });
            } else {
                const newId = crypto.randomUUID();
                const savedNote = {
                    ...noteData,
                    id: newId,
                    sync_status: 'pending',
                    createdAt: new Date().toISOString()
                };
                await db.notes.add(savedNote);
            }
            if (user) {
                import('../../utils/syncService.js').then(({ autoSync }) => autoSync(user));
            }
        } catch (error) {
            console.error("Error saving note:", error);
        }
    };

    const handleArchiveNow = async () => {
        const newStatus = !isArchived;
        const activeId = isEditMode ? note.id : crypto.randomUUID();

        const noteData = {
            id: activeId,
            user_id: user.id,
            title,
            content,
            isList,
            listItems,
            imageUrl: imageFile,
            isArchived: newStatus,
            isPinned: false,
            sync_status: 'pending',
            updatedAt: new Date().toISOString(),
            ...(!isEditMode && { createdAt: new Date().toISOString() })
        };

        try {
            await db.notes.put(noteData);
            if (user) import('../../utils/syncService.js').then(({ autoSync }) => autoSync(user));

            const message = newStatus ? "Note archived" : "Note unarchived";
            showSnackbar(message, async () => {
                await db.notes.update(activeId, { isArchived: !newStatus, sync_status: 'pending' });
                if (user) import('../../utils/syncService.js').then(({ autoSync }) => autoSync(user));
            });

            onClose();
        } catch (error) {
            console.error("Error archiving:", error);
        }
    };

    const handleTrashNow = async () => {
        const activeId = isEditMode ? note.id : crypto.randomUUID();

        const noteData = {
            id: activeId,
            user_id: user.id,
            title,
            content,
            isList,
            listItems,
            imageUrl: imageFile,
            isTrashed: true,
            isPinned: false,
            isArchived: false,
            sync_status: 'pending',
            updatedAt: new Date().toISOString(),
            trashedAt: new Date().toISOString(),
            ...(!isEditMode && { createdAt: new Date().toISOString() })
        };

        try {
            await db.notes.put(noteData);
            if (user) import('../../utils/syncService.js').then(({ autoSync }) => autoSync(user));

            showSnackbar("Note moved to trash", async () => {
                await db.notes.update(activeId, { isTrashed: false, sync_status: 'pending' });
                if (user) import('../../utils/syncService.js').then(({ autoSync }) => autoSync(user));
            });

            onClose();
        } catch (error) {
            console.error("Error trashing:", error);
        }
    };

    const handleClose = async () => {
        await handleSave();
        onClose();
    };

    const editorRef = useClickOutside(handleClose);

    // --- RENDER ---
    return (
        <div className="note-editor-overlay">
            <div className="note-editor-container" ref={editorRef}>
                {imageFile && (
                    <div className="ne-image-preview">
                        <img src={imageFile} alt="Preview" />
                        <button onClick={() => setImageFile(null)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}
                <div className='ne-text-area'>
                    <input type='text' className='ne-title' placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={!isEditMode} />
                    {isList ? (
                        <div className="ne-list-container">
                            {listItems.map((item, index) => (
                                <div key={item.id} className="ne-list-item">
                                    <input type="checkbox" checked={item.isChecked} onChange={() => toggleCheckbox(item.id)} />
                                    <input type="text" value={item.text} onChange={(e) => updateListItem(item.id, e.target.value)} onKeyDown={(e) => handleListKeyDown(e, index, item.id)} autoFocus />
                                    <button onClick={() => removeListItem(item.id)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            ))}
                            <div className="ne-list-add" onClick={() => addListItem()}>
                                <i className="fa-solid fa-plus"></i> List Item
                            </div>
                        </div>
                    ) : (
                        <textarea className="ne-content" placeholder="Take a note..." value={content} onChange={(e) => { setContent(e.target.value) }} ref={textareaRef} rows={1} />
                    )}
                </div>

                <div className='ne-footer'>
                    <div className='ne-footer-buttons'>
                        <button className={`ne-pin-btn ${isPinned ? 'active' : ''}`} onClick={() => setIsPinned(!isPinned)} data-tooltip-text={isPinned ? 'Unpin Note' : 'Pin Note'}>
                            <i className="fa-solid fa-thumbtack"></i>
                        </button>
                        <button className={`ne-checkbox-btn ${isList ? 'active' : ''} `} onClick={toggleMode} data-tooltip-text='Show Tick Boxes'>
                            <i className="fa-solid fa-check-square"></i>
                        </button>
                        <button className='ne-image-btn' onClick={() => fileInputRef.current.click()} data-tooltip-text='Add Image'>
                            <i className="fa-regular fa-image"></i>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageSelect}
                        />
                        <button className={`ne-archive-btn ${isArchived ? 'active' : ''}`} onClick={handleArchiveNow} data-tooltip-text='Archive Note'>
                            <i className="fa-solid fa-box-archive"></i>
                        </button>
                        {isEditMode && (
                            <button className={`ne-delete-btn ${isTrashed ? 'active' : ''}`} onClick={handleTrashNow} data-tooltip-text='Move to Trash'>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        )}
                    </div>
                    <button className='ne-close-btn' onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteEditor;