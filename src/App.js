import React, { useEffect, useState } from 'react';
import CustomSql from './CustomSql';
import ExtensionButtons from './ExtensionButtons';
import Storage from './Storage';
import HideSum from './HideSum';
import Dashboard from './Dashboard';
import { getDB } from './db';

export default function App() {
    function setHideSumLs({ target }) {
        localStorage.hideSum = target.checked ? '1' : '0';
        setHideSum(target.checked);
    }

    const [customQueries, setCustomQueries] = useState(null);
    const [db, setDB] = useState(null);
    const [hideSum, setHideSum] = useState(localStorage.hideSum === '1');

    useEffect(() => {
        const handler = () => { getDB().then(db => setDB(db)) };
        handler();
        window.addEventListener('localStorageUpdate', handler);
        return () => { window.removeEventListener('localStorageUpdate', handler); };
    }, []);

    return <>
        <h3><a href="#rtxdata">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <CustomSql setCustomQueries={setCustomQueries} />
        </div>
        <ExtensionButtons />
        <Storage />
        <HideSum hideSum={hideSum} setHideSum={setHideSumLs} />
        {db ? <Dashboard db={db.db} queries={customQueries || db.queries} hideSum={hideSum} /> : "Загрузка..."}
    </>;
}
