import React, { useEffect, useState } from 'react';

import StorageItems from './StorageItems';
import StorageClear from './StorageClear';
import StorageAdd from './StorageAdd';
import ExtensionButtons from './ExtensionButtons';
import CustomSql from './CustomSql';
import Dashboard from './Dashboard';
import PieNoSum from './PieNoSum';

import { getDB } from './db';

export default function App() {
    const [db, setDB] = useState(null);

    useEffect(() => { getDB().then(db => setDB(db)); }, []);

    useEffect(() => {
        if (window.inited) { return; }
        window.inited = true;

        window.pieNoSum = document.querySelector('#pieNoSum');
        window.pieNoSum.checked = localStorage.pieNoSum === '1';
    }, []);

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

        <PieNoSum />

        <Dashboard db={db} />
    </>;
}
