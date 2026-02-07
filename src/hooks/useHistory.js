import { useState, useCallback } from 'react';

export const useHistory = (initialState) => {
    const [history, setHistory] = useState([initialState]);
    const [index, setIndex] = useState(0);

    // Current State is always history[index]
    const state = history[index];

    // Function to update state and save a new snapshot
    const set = useCallback((newState) => {
        setHistory((prevHistory) => {
            // If we are in the middle of history and make a change,
            // we delete the "future" (like standard undo/redo behavior)
            const newHistory = prevHistory.slice(0, index + 1);
            return [...newHistory, newState];
        });
        setIndex((prevIndex) => prevIndex + 1);
    }, [index]);

    const undo = useCallback(() => {
        setIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }, []);

    const redo = useCallback(() => {
        setIndex((prevIndex) => Math.min(prevIndex + 1, history.length - 1));
    }, [history.length]);

    return {
        state,
        set,
        undo,
        redo,
        canUndo: index > 0,
        canRedo: index < history.length - 1
    };
};