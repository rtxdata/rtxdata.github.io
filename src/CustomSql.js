import React, { useCallback } from "react";

export default function CustomSql() {
    const runCustomSql = useCallback(() => {
        const customQuery = prompt("Введите SQL запрос", localStorage.sql || "SELECT * FROM RaiffTxns;");
        if (customQuery !== null) {
            localStorage.sql = customQuery;
            window.results.innerHTML = '';

            window.dashboard({ [customQuery]: customQuery });
            document.querySelector("#nav").innerHTML = '';
        }
    });

    return <button onClick={runCustomSql}>Выполнить SQL</button>;
}