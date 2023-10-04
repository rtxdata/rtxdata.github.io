import React, { useContext } from 'react';
import Plotly from 'react-plotly.js';
import { Context } from './Context';
import HideSum from './HideSum';

export default function Pie({ df, title }) {
    const { hideSum } = useContext(Context);

    return <>
        <HideSum />
        <Plotly data={[{
            type: 'pie',
            labels: df.values.map(d => d[0]),
            values: df.values.map(d => d[1]),
            textinfo: hideSum ? 'percent' : 'value+percent'
        }]} layout={{ title: title, width: 700 }} />
    </>;
}
