import React from 'react';
import Plotly from 'react-plotly.js';

export default function Pie({ df, title, hideSum }) {
    return <Plotly data={[{
        type: 'pie',
        labels: df.values.map(d => d[0]),
        values: df.values.map(d => d[1]),
        textinfo: hideSum ? 'percent' : 'value+percent'
    }]} layout={{
        title: title,
        width: 700
    }} />;
}
