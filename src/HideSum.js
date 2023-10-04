import React, { useContext } from "react";
import { Context } from './Context';

export default function HideSum() {
    const { hideSum, setHideSum } = useContext(Context);
    return <div className="content">
        <input type="checkbox" id="hideSum" value={hideSum} onChange={setHideSum} />
        <label htmlFor="hideSum">Скрыть суммы на круговых диаграммах</label>
    </div>
}