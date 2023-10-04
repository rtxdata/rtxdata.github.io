import React, { useRef } from "react";

export default function Storage() {
    function onChoose() { fileRef.current.click(); }

    function deleteItem(name) {
        delete localStorage[name];
        window.dispatchEvent(new Event('localStorageUpdate'));
    };

    function deleteAll() {
        localStorage.clear();
        window.dispatchEvent(new Event('localStorageUpdate'));
    }

    function onFile({ target }) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = ({ target }) => window.save(file.name, target.result);
        reader.readAsText(file);
    };

    function downloadItem(name) {
        const element = document.createElement('a');
        element.href = URL.createObjectURL(new Blob([localStorage[name]], { type: "application/json" }));
        element.download = name;
        element.click();
    };

    const fileRef = useRef(null);
    const names = Object.keys(localStorage).filter(k => k.endsWith('.json'));

    return <>
        <input ref={fileRef} onChange={onFile} type="file" accept=".json" style={{ display: 'none' }} />
        <div className="content">
            <button onClick={onChoose}>Импорт данных из json</button>
            <a href="https://github.com/rtxdata/rtxdata.github.io#скачиваем-свои-данные">Где их взять?</a>
        </div>
        <div className="content">
            {names.length === 0 ? null : names.map(name => (
                <div key={name}>
                    <a href="#dl" onClick={() => downloadItem(name)}>
                        {name}
                    </a>
                    <span> ({((localStorage[name].length * 2) / 1024 / 1024).toFixed(2)} MB) </span>
                    <a href="#del" onClick={() => deleteItem(name)}>
                        Удалить
                    </a>
                </div>
            ))}
        </div>
        <div className="content">
            <button onClick={deleteAll}>Очистить локальное хранилище</button>
        </div>
    </>
}