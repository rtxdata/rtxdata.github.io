import React, { useEffect, useState, useCallback } from 'react';

import DataElement from './DataElement';

window.element = function (item, type = 'div') {
    const elem = document.createElement(type);
    elem.innerText = String(item);
    elem.id = String(item);
    return elem;
}

window.datePlotElement = function (df, title) {
    const div = document.createElement('div');
    const dataObj = Object.fromEntries(df.values), dates = df.values.map(e => new Date(e[0]));
    const minDate = new Date(Math.min(...dates)), maxDate = new Date(Math.max(...dates));
    const x = [], y = [];

    for (let dt = minDate; dt <= maxDate; dt.setDate(dt.getDate() + 1)) {
        const strDate = new Date(dt).toISOString().split('T')[0];
        x.push(strDate);
        y.push(dataObj[strDate] || 0);
    }

    window.Plotly.newPlot(div, [{ type: 'scatter', mode: 'lines', x, y, line: { shape: 'linear' } }],
        { title, xaxis: { title: '' }, yaxis: { title: '' } });
    return div;
}

window.totalPieElement = function (df, title) {
    const div = document.createElement('div');

    window.Plotly.newPlot(div, [{
        type: 'pie',
        labels: df.values.map(d => d[0]),
        values: df.values.map(d => d[1]),
        textinfo: window.pieNoSum.checked ? 'percent' : 'value+percent'
    }], { title, width: 700 });

    return div;
}

window.tableElement = function (df, title) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    df.columns.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    df.values.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(value => {
            const td = document.createElement('td');
            td.innerText = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
}

export default function DashboardItem({ item, queryText }) {
    const [df, setDf] = useState(null);
    const [filterValues, setFilterValues] = useState([]);
    const [selected, setSelected] = useState('all');
    const handleDateChange = useCallback((e) => { setSelected(e.target.value); }, [setSelected]);

    useEffect(() => {
        const usedDates = new Set();

        const overrides = {
            dt(val) {
                const value = val.slice(0, 7);
                usedDates.add(value);
                return selected === 'all' || selected === value;
            }
        };

        for (let key in overrides) {
            window.db.create_function(key, overrides[key]);
        }

        const result = window.db.exec(queryText);
        setDf(result.length === 0 ? null : result[result.length - 1]);

        if (usedDates.size > 0) { setFilterValues(["all", ...Array.from(usedDates).sort()]); }

        if (filterValues.length === 0) {
            setFilterValues(Array.from(usedDates).sort());
        }

    }, [item, queryText, selected, filterValues.length]);

    return (
        <div>
            <h3 id={item}>{item}</h3>
            <pre><code class="language-sql">{queryText}</code></pre>
            {filterValues.length > 0 && (
                <div>
                    Дата:
                    <select value={selected} onChange={handleDateChange}>
                        {[...filterValues].map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                </div>
            )}
            <DataElement df={df} name={item} />
        </div>
    );
}

