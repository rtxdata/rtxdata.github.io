import React, { useEffect, useState } from 'react';

import LocalStorageItems from './LocalStorageItems';
import ExtensionButtons from './ExtensionButtons';
import CustomSql from './CustomSql';
import ClearStorage from './ClearStorage';
import Dashboard from './Dashboard';
import PieNoSum from './PieNoSum';

import { getDB } from './db';

export default function App() {
    const [queriesState, setQueriesState] = useState({});

    useEffect(() => {
        (async () => {
            if (window.inited) { return; }
            window.inited = true;

            window.results = document.querySelector("#results");
            window.fileinput = document.querySelector('input[type=file]');
            window.pieNoSum = document.querySelector('#pieNoSum');
            window.ls = document.querySelector('#ls');

            window.pieNoSum.checked = localStorage.pieNoSum === '1';

            window.fileinput.addEventListener('change', ({ target }) => {
                const file = target.files[0];
                const reader = new FileReader();

                reader.onload = ({ target }) => window.save(file.name, target.result);
                reader.readAsText(file);
            });

            const { db, queries } = await getDB();
            window.db = db;

            setQueriesState(queries);
        })();
    }, []);

    return <>
        <h3><a href="#rtxdata">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <CustomSql />
        </div>
        <ExtensionButtons />
        <div className="content">
            <button onClick={() => window.fileinput.click()}>Импорт данных из json</button>
            <a href="https://github.com/rtxdata/rtxdata.github.io#скачиваем-свои-данные">Где их взять?</a>
        </div>
        <LocalStorageItems />
        <ClearStorage />
        <PieNoSum />
        <input id="fileinput" type="file" accept=".json" style={{ display: 'none' }} />
        <nav id="nav">{Object.keys(queriesState).map(text => <a key={text} href={"#" + encodeURIComponent(text)}>{text}</a>)}</nav >
        <div id="results">
            <Dashboard queriesState={queriesState} />
        </div>
    </>;
}
