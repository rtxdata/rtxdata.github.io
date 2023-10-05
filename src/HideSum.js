import React, { useContext } from "react";
import { Context } from './Context';

let i = 0;

export default function HideSum() {
    const { hideSum, setHideSum } = useContext(Context);
    i++;
    return <div className="content">
        <input type="checkbox" id={"hideSum" + i} checked={hideSum} onChange={setHideSum} />{" "}
        <label htmlFor={"hideSum" + i}>Скрыть суммы на круговых диаграммах</label>
    </div>
}
