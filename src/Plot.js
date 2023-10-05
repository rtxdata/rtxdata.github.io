import React from 'react';
import Plotly from 'react-plotly.js';

export default function Plot({ df, title }) {
    const dataObj = Object.fromEntries(df.values), dates = df.values.map(e => new Date(e[0]));
    const minDate = new Date(Math.min(...dates)), maxDate = new Date(Math.max(...dates));
    const x = [], y = [];

    for (let dt = new Date(minDate); dt <= maxDate; dt.setDate(dt.getDate() + 1)) {
        const strDate = dt.toISOString().split('T')[0];
        x.push(strDate);
        y.push(dataObj[strDate] || 0);
    }

    return (
        <Plotly
            data={[{ type: 'scatter', mode: 'lines', x, y, line: { shape: 'linear' } }]}
            layout={{ title, xaxis: { title: '' }, yaxis: { title: '' } }}
        />
    );
}
