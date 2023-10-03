import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

window.element = function (item, type = 'div') {
  const element = document.createElement(type);
  element.innerText = String(item);
  element.id = String(item);
  return element;
}

window.headerElement = function (text) {
  const a = document.createElement('a');
  const h3 = document.createElement('h3');

  a.innerText = h3.id = h3.innerText = text;
  a.href = "#" + encodeURIComponent(a.innerText);
  document.querySelector("#nav").appendChild(a);
  return h3;
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

  Plotly.newPlot(div, [{ type: 'scatter', mode: 'lines', x, y, line: { shape: 'linear' } }],
    { title, xaxis: { title: '' }, yaxis: { title: '' } });
  return div;
}

window.totalPieElement = function (df, title) {
  const div = document.createElement('div');

  Plotly.newPlot(div, [{
    type: 'pie',
    labels: df.values.map(d => d[0]),
    values: df.values.map(d => d[1]),
    textinfo: pieNoSum.checked ? 'percent' : 'value+percent'
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

    const df = query(queryText);
    if (!df || df.values.length === 0) {
      return (element('Нет данных'));
    } else if (df.columns.length === 2 && df.columns[0] === 'date') {
      return (datePlotElement(df, name));
    } else if (df.columns.length === 2 && df.columns[1] === 'total') {
      return (totalPieElement(df, name));
    } else {
      return (tableElement(df, name));
    }
  } catch (e) {
    console.error(e);
    return (element(`Ошибка ${e}`));
  }
}

window.dashboard = function (queries) {
  for (let item in queries) {
    const queryText = queries[item];
    const container = document.createElement("div");
    results.appendChild(container);

    container.appendChild(headerElement(item));
    container.appendChild(queryElement(queryText));

    const filter = document.createElement("div");
    container.appendChild(filter);

    const res = document.createElement("div");
    container.appendChild(res);

    function setResult(overrides) {
      res.innerHTML = '';
      res.appendChild(dataElement(queryText, item, overrides));
    }

    const dates = new Set();
    setResult({
      dt(val) {
        dates.add(val.slice(0, 7));
        return true;
      }
    });

    if (dates.size > 0) {
      const datesArr = ['all', ...Array.from(dates).sort()];
      const select = document.createElement('select');
      select.addEventListener('change', ({ target }) => {
        setResult({
          dt(val) {
            dates.add();
            return target.value === 'all' || val.slice(0, 7) === target.value;
          }
        });
      });

      datesArr.forEach(opt => {
        const option = document.createElement('option');
        option.text = option.value = opt;
        select.appendChild(option);
      });

      filter.innerText = "Дата:"
      filter.appendChild(select);
    }
  }

  Prism.highlightAll();
  const element = document.getElementById(decodeURIComponent(location.hash.substring(1)));
  if (element) { element.scrollIntoView(); }
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
  location.hash = '';
  location.reload();
}



navigator?.serviceWorker?.register('/sw.js');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode >
);