import React, { useCallback } from "react";

export default function StorageClear() {
    const clearLS = useCallback(() => {
        localStorage.clear();
        window.dispatchEvent(new Event('localStorageUpdate'));
    }, []);

    return <div className="content">
        <button onClick={clearLS}>Очистить локальное хранилище</button>
    </div>;
}