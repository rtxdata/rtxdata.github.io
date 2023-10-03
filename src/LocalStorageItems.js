import React from 'react';

export default function LocalStorageItems() {
    const names = Object.keys(localStorage).filter(k => k.endsWith('.json'));

    const downloadItem = name => {
        const element = document.createElement('a');
        element.href = URL.createObjectURL(new Blob([localStorage[name]], { type: "application/json" }));
        element.download = name;
        element.click();
    };

    const deleteItem = name => {
        delete localStorage[name];
        window.location.hash = '';
        window.location.reload();
    };

    return (
        <div>
            {names.length === 0 ? null : names.map(name => (
                <div key={name}>
                    <a href="#" onClick={() => downloadItem(name)}>
                        {name}
                    </a>
                    <span> ({((localStorage[name].length * 2) / 1024 / 1024).toFixed(2)} MB) </span>
                    <a href="#" onClick={() => deleteItem(name)}>
                        Удалить
                    </a>
                </div>
            ))}
        </div>
    );
}