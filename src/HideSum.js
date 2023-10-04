import React from "react";

export default function HideSum({ hideSum, setHideSum }) {
    return <div className="content">
        <input type="checkbox" id="hideSum" value={hideSum} onChange={setHideSum} />
        <label htmlFor="hideSum">Скрыть суммы на круговых диаграммах</label>
    </div>
}