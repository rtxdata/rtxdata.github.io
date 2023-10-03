import React, { useCallback } from "react";

export default function PieNoSum() {
    const pieNoSumChanged = useCallback(() => {
        localStorage.pieNoSum = window.pieNoSum.checked ? '1' : '0';
        window.location.hash = '';
        window.location.reload();
    });

    return <div className="content">
        <input type="checkbox" id="pieNoSum" onChange={pieNoSumChanged} />
        <label htmlFor="pieNoSum">Скрыть суммы на круговых диаграммах</label>
    </div>
}