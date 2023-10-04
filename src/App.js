import React, { useEffect, useState } from 'react';

import LocalStorageItems from './LocalStorageItems';
import ExtensionButtons from './ExtensionButtons';
import CustomSql from './CustomSql';
import ClearStorage from './ClearStorage';
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


        window.fileinput = document.querySelector('input[type=file]');
        window.fileinput.addEventListener('change', ({ target }) => {
            const file = target.files[0];
            const reader = new FileReader();

            reader.onload = ({ target }) => window.save(file.name, target.result);
            reader.readAsText(file);
        });
    }, []);

    return <>
        <h3><a href="#rtxdata">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <CustomSql />
        </div>
        <ExtensionButtons />

        <input id="fileinput" type="file" accept=".json" style={{ display: 'none' }} />
        <div className="content">
            <button onClick={() => window.fileinput.click()}>Импорт данных из json</button>
            <a href="https://github.com/rtxdata/rtxdata.github.io#скачиваем-свои-данные">Где их взять?</a>
        </div>

        <LocalStorageItems />
        <ClearStorage />
        <PieNoSum />
        <Dashboard db={db} />
    </>;
}
