import { useLayoutEffect, useRef } from 'react';

// Added 'trigger' parameter
export const useAutoResizeTextArea = (value, trigger) => {
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        if (textareaRef.current) {
            // Reset height to auto to shrink if text was deleted
            textareaRef.current.style.height = "auto";
            // Set height to scrollHeight to fit content
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value, trigger]); // Re-run when value OR the trigger (isList) changes

    return textareaRef;
};