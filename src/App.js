import React, { useEffect, useState } from 'react';

import StorageItems from './StorageItems';
import StorageClear from './StorageClear';
import StorageAdd from './StorageAdd';
import ExtensionButtons from './ExtensionButtons';
import CustomSql from './CustomSql';
import Dashboard from './Dashboard';
import HideSum from './HideSum';

import { getDB } from './db';

export default function App() {
    const [customQueries, setCustomQueries] = useState(null);
    const [db, setDB] = useState(null);
    const [hideSum, setHideSum] = useState(localStorage.hideSum === '1')

    useEffect(() => {
        const handler = () => { getDB().then(db => setDB(db)) };
        handler();
        window.addEventListener('localStorageUpdate', handler);
        return () => { window.removeEventListener('localStorageUpdate', handler); };
    }, []);

    const setHideSumLs = ({ target }) => {
        localStorage.hideSum = target.checked ? '1' : '0';
        setHideSum(target.checked);
    }

    return <>
        <h3><a href="#rtxdata">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <CustomSql setCustomQueries={setCustomQueries} />
        </div>

        <ExtensionButtons />

        <StorageAdd />
        <StorageItems />
        <StorageClear />

        <HideSum hideSum={hideSum} setHideSum={setHideSumLs} />

        {db ? <Dashboard db={db.db} queries={customQueries || db.queries} hideSum={hideSum} /> : null}
    </>;
}
