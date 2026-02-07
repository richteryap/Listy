import { createContext, useState, useContext, useEffect } from 'react';

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        isOpen: false,
        message: '',
        undoAction: null,
    });

    useEffect(() => {
        if (snackbar.isOpen) {
            const timer = setTimeout(() => {
                setSnackbar(prev => ({ ...prev, isOpen: false }));
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.isOpen], snackbar.message);

    const showSnackbar = (message, undoAction) => {
        setSnackbar({
            isOpen: true,
            message,
            undoAction,
        });
    };

    const handleUndo = () => {
        if (snackbar.undoAction) {
            snackbar.undoAction();
        }
        setSnackbar(prev => ({ ...prev, isOpen: false }));
    };

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <div className={`snackbar ${snackbar.isOpen ? 'show' : ''}`}>
                <span className="snackbar-text">{snackbar.message}</span>
                {snackbar.undoAction && (
                    <button className="snackbar-undo-btn" onClick={handleUndo}>
                        Undo
                    </button>
                )}
                <button className="snackbar-close-btn" onClick={closeSnackbar}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        </SnackbarContext.Provider>
    );
};