/* eslint-disable */
import React from 'react';

export default function Header() {
    return (<><h3><a href="#">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <button onClick={() => window.runCustomSql()}>Выполнить SQL</button>
        </div>
        <div className="content" id="extension" style={{ display: 'none' }}>
            <button onClick={() => window.openRaiff()}>Загрузить с raiffeisenbank.rs</button>
            <button onClick={() => window.openWolt()}>Загрузить с wolt.com</button>
        </div>
        <div className="content">
            <button onClick={() => window.fileinput.click()}>Импорт данных из json</button>
            <a href="https://github.com/rtxdata/rtxdata.github.io#скачиваем-свои-данные">Где их взять?</a>
        </div>
        <div className="content" id="ls"></div>
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