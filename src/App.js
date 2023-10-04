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
    const [db, setDB] = useState(null);
    const [hideSum, setHideSum] = useState(localStorage.hideSum === '1')

    useEffect(() => { getDB().then(db => setDB(db)); }, []);

    const setHideSumLs = ({ target }) => {
        localStorage.hideSum = target.checked ? '1' : '0';
        setHideSum(target.checked);
    }

    return <>
        <h3><a href="#rtxdata">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <CustomSql />
        </div>

        <ExtensionButtons />

        <StorageAdd />
        <StorageItems />
        <StorageClear />

        <HideSum hideSum={hideSum} setHideSum={setHideSumLs} />

        <Dashboard db={db} hideSum={hideSum} />
    </>;
}
