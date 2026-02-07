import { useState } from 'react';

export const useNoteContent = (initialData = {}) => {
    const [isList, setIsList] = useState(initialData.isList || false);
    const [content, setContent] = useState(initialData.content || '');
    const [listItems, setListItems] = useState(initialData.listItems || []);

    const toggleMode = () => {
        if (isList) {
            const text = listItems.map(item => item.text).join('\n');
            setContent(text);
        } else {
            const items = content.split('\n')
                .filter(line => line.trim() !== '')
                .map(text => ({
                    id: Date.now() + Math.random(),
                    text: text,
                    isChecked: false
                }));
            
            if (items.length === 0) {
                items.push({ id: Date.now(), text: '', isChecked: false });
            }
            setListItems(items);
        }
        setIsList(!isList);
    };

    const updateListItem = (id, text) => {
        setListItems(prev => prev.map(item => item.id === id ? { ...item, text } : item));
    };

    const toggleCheckbox = (id) => {
        setListItems(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
    };

    const addListItem = (index) => {
        const newItem = { id: Date.now() + Math.random(), text: '', isChecked: false };
        if (index !== undefined) {
            const newItems = [...listItems];
            newItems.splice(index + 1, 0, newItem);
            setListItems(newItems);
        } else {
            setListItems(prev => [...prev, newItem]);
        }
    };

    const removeListItem = (id) => {
        setListItems(prev => prev.filter(item => item.id !== id));
    };

    const handleListKeyDown = (e, index, id) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addListItem(index);
        }
        if (e.key === 'Backspace' && listItems[index].text === '' && listItems.length > 1) {
            e.preventDefault();
            removeListItem(id);
        }
    };

    return {
        isList,
        setIsList,
        content,
        setContent,
        listItems,
        setListItems,
        toggleMode,
        updateListItem,
        toggleCheckbox,
        addListItem,
        removeListItem,
        handleListKeyDown
    };
};