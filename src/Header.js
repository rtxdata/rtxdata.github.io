/* eslint-disable */
import React from 'react';
import LocalStorageItems from './LocalStorageItems';
import ExtensionButtons from './ExtensionButtons';

export default function Header() {
    return (<><h3><a href="#">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <button onClick={() => window.runCustomSql()}>Выполнить SQL</button>
        </div>
        <ExtensionButtons />
        <div className="content">
            <button onClick={() => window.fileinput.click()}>Импорт данных из json</button>
            <a href="https://github.com/rtxdata/rtxdata.github.io#скачиваем-свои-данные">Где их взять?</a>
        </div>
        <LocalStorageItems />
        <div className="content">
            <button onClick={() => {
                localStorage.clear(); location.hash = ''; location.reload()
            }}>Очистить локальное хранилище</button>
        </div>
        <div className="content">
            <input type="checkbox" id="pieNoSum" onChange={() => window.pieNoSumChanged()} />
            <label htmlFor="pieNoSum">Скрыть суммы на круговых диаграммах</label>
        </div>
        <input id="fileinput" type="file" accept=".json" style={{ display: 'none' }} />
        <nav id="nav"></nav>
        <div id="results"></div></>);
}