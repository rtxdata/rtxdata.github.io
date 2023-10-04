import React, { useRef } from "react";

export default function StorageAdd() {
    const fileRef = useRef(null);

    const onClick = () => {
        fileRef.current.click();
    }

    const onChange = ({ target }) => {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onload = ({ target }) => window.save(file.name, target.result);
        reader.readAsText(file);
    };

    return <>
        <input ref={fileRef} onChange={onChange} type="file" accept=".json" style={{ display: 'none' }} />
        <div className="content">
            <button onClick={onClick}>Импорт данных из json</button>
            <a href="https://github.com/rtxdata/rtxdata.github.io#скачиваем-свои-данные">Где их взять?</a>
        </div>
    </>
}