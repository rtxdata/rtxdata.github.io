import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

window.element = function (item, type = 'div') {
  const elem = document.createElement(type);
  elem.innerText = String(item);
  elem.id = String(item);
  return elem;
}

window.queryElement = function (query) {
  const queryDiv = document.createElement("div");
  queryDiv.innerHTML = '<pre><code class="language-sql"></code></pre>';
  queryDiv.querySelector('code').innerText = query;
  return queryDiv;
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

window.dataElement = function (queryText, name, overrides) {
  try {
    for (let key in overrides) {
      window.db.create_function(key, overrides[key]);
    }

    const df = window.query(queryText);
    if (!df || df.values.length === 0) {
      return (window.element('Нет данных'));
    } else if (df.columns.length === 2 && df.columns[0] === 'date') {
      return (window.datePlotElement(df, name));
    } else if (df.columns.length === 2 && df.columns[1] === 'total') {
      return (window.totalPieElement(df, name));
    } else {
      return (window.tableElement(df, name));
    }
  } catch (e) {
    console.error(e);
    return (window.element(`Ошибка ${e}`));
  }
}

window.query = function (sqlQuery) {
  const result = window.db.exec(sqlQuery);
  if (result.length === 0) { return null; }

  const { columns, values } = result[result.length - 1];
  return { columns, values };
}

// API!
window.save = function (key, value) {
  localStorage[key] = value;
  window.location.hash = '';
  window.location.reload();
}

navigator?.serviceWorker?.register('/sw.js');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode >);