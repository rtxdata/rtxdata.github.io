/* eslint-disable */
import React, { useCallback } from 'react';
import LocalStorageItems from './LocalStorageItems';
import ExtensionButtons from './ExtensionButtons';

export default function Header() {
    const runCustomSql = useCallback(() => {
        const customQuery = prompt("Введите SQL запрос", localStorage.sql || "SELECT * FROM RaiffTxns;");
        if (customQuery !== null) {
            localStorage.sql = customQuery;
            results.innerHTML = '';

            dashboard({ [customQuery]: customQuery });
            document.querySelector("#nav").innerHTML = '';
        }
    });

    const clearLS = useCallback(() => {
        localStorage.clear();
        location.hash = '';
        location.reload();
    });

    const pieNoSumChanged = useCallback(() => {
        localStorage.pieNoSum = pieNoSum.checked ? '1' : '0';
        location.hash = '';
        location.reload();
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