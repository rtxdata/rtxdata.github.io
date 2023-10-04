import React, { useCallback } from "react";

export default function ClearStorage() {
    const clearLS = useCallback(() => {
        localStorage.clear();
        window.location.hash = '';
        window.location.reload();
    }, []);

    return <div className="content">
        <button onClick={clearLS}>Очистить локальное хранилище</button>
    </div>;
}