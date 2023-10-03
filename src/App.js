import React, { useCallback, useEffect } from 'react';

import LocalStorageItems from './LocalStorageItems';
import ExtensionButtons from './ExtensionButtons';

import { getDB } from './db';

export default function App() {
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
                // eslint-disable-next-line no-undef
                reader.onload = ({ target }) => save(file.name, target.result);
                reader.readAsText(file);
            });

            const { db, queries } = await getDB();
            window.db = db;

            window.dashboard(queries);
        })();
    }, []);

    const runCustomSql = useCallback(() => {
        const customQuery = prompt("Введите SQL запрос", localStorage.sql || "SELECT * FROM RaiffTxns;");
        if (customQuery !== null) {
            localStorage.sql = customQuery;
            window.results.innerHTML = '';

            window.dashboard({ [customQuery]: customQuery });
            document.querySelector("#nav").innerHTML = '';
        }
    });

    const clearLS = useCallback(() => {
        localStorage.clear();
        window.location.hash = '';
        window.location.reload();
    });

    const pieNoSumChanged = useCallback(() => {
        localStorage.pieNoSum = window.pieNoSum.checked ? '1' : '0';
        window.location.hash = '';
        window.location.reload();
    });

    return <>
        <h3><a href="#">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <button onClick={runCustomSql}>Выполнить SQL</button>
        </div>
        <ExtensionButtons />
        <div className="content">
            <button onClick={() => window.fileinput.click()}>Импорт данных из json</button>
            <a href="https://github.com/rtxdata/rtxdata.github.io#скачиваем-свои-данные">Где их взять?</a>
        </div>
        <LocalStorageItems />
        <div className="content">
            <button onClick={clearLS}>Очистить локальное хранилище</button>
        </div>
        <div className="content">
            <input type="checkbox" id="pieNoSum" onChange={pieNoSumChanged} />
            <label htmlFor="pieNoSum">Скрыть суммы на круговых диаграммах</label>
        </div>
        <input id="fileinput" type="file" accept=".json" style={{ display: 'none' }} />
        <nav id="nav"></nav>
        <div id="results"></div>
    </>;
}