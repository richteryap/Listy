import { useEffect, useRef } from 'react';

export const useClickOutside = (handler) => {
    const domNode = useRef();

    useEffect(() => {
        const checkClickOutside = (e) => {
            if (domNode.current && !domNode.current.contains(e.target)) {
                handler();
            }
        };

        document.addEventListener("mousedown", checkClickOutside);

        return () => {
            document.removeEventListener("mousedown", checkClickOutside);
        };
    }, [handler]);

    return domNode;
};