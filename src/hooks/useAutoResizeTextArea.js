import { useLayoutEffect, useRef } from 'react';

export const useAutoResizeTextArea = (value, trigger) => {
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value, trigger]);

    return textareaRef;
};