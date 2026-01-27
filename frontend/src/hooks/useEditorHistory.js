import { useState, useCallback } from 'react';

const useEditorHistory = (initialState) => {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentState = history[currentIndex];

    const pushState = useCallback((newState) => {
        setHistory((prevHistory) => {
            const newHistory = prevHistory.slice(0, currentIndex + 1);
            return [...newHistory, newState];
        });
        setCurrentIndex((prevIndex) => prevIndex + 1);
    }, [currentIndex]);

    const undo = useCallback(() => {
        setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1));
    }, []);

    const redo = useCallback(() => {
        setCurrentIndex((prevIndex) => Math.min(history.length - 1, prevIndex + 1));
    }, [history.length]);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    return {
        state: currentState,
        pushState,
        undo,
        redo,
        canUndo,
        canRedo,
        history,
        currentHistoryIndex: currentIndex
    };
};

export default useEditorHistory;
