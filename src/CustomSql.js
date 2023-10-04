import React, { useCallback } from "react";

export default function CustomSql({ setCustomQueries }) {
    const runCustomSql = useCallback(() => {
        const customQuery = prompt("Введите SQL запрос", localStorage.sql || "SELECT * FROM RaiffTxns;");
        if (customQuery === null) { return; }

        localStorage.sql = customQuery;
        setCustomQueries({ [customQuery]: customQuery });
    }, []);

    return <button onClick={runCustomSql}>Выполнить SQL</button>;
}