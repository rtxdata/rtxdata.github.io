import React, { createContext, useState, useEffect } from 'react';
import { getDB } from './db';

export const Context = createContext();

export const Provider = ({ children }) => {
    function setHideSum({ target }) {
        localStorage.hideSum = target.checked ? '1' : '0';
        setHideSumOrig(target.checked);
    }

    const [db, setDB] = useState(null);
    const [hideSum, setHideSumOrig] = useState(localStorage.hideSum === '1');

    useEffect(() => {
        const handler = () => { getDB().then(setDB); };
        handler();
        window.addEventListener('localStorageUpdate', handler);
        return () => { window.removeEventListener('localStorageUpdate', handler); };
    }, []);

    return <Context.Provider value={{ db, hideSum, setHideSum }}>{children}</Context.Provider>;
};
