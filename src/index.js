/* eslint-disable */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Header from './Header';
import './index.css';

import dashboardSQLPath from './dashboard.sql';
import { ratesRsd, formatDateString, formatDateTime, parseRef } from './utils';


window.printLs = function () {
  const names = Object.keys(localStorage).filter(k => k.endsWith('.json'));
  if (names.length === 0) { return };

  for (let name of names) {
    const div = document.createElement("div");

    const dl = document.createElement("a");
    dl.innerText = `${name}`;
    dl.href = "#";
    dl.addEventListener("click", () => {
      const element = document.createElement('a');
      element.href = URL.createObjectURL(new Blob([localStorage[name]], { type: "application/json" }));
      element.download = name;
      element.click();
    });
    div.appendChild(dl);

    div.appendChild(document.createTextNode(` (${(localStorage[name].length * 2 / 1024 / 1024).toFixed(2)} MB) `));

    const del = document.createElement("a");
    del.innerText = `Удалить`;
    del.href = "#";
    del.addEventListener("click", () => {
      delete localStorage[name];
      location.hash = '';
      location.reload();
    });
    div.appendChild(del);

    ls.appendChild(div);
  }
}

window.scroll = function () {
  const element = document.getElementById(decodeURIComponent(location.hash.substring(1)));
  if (element) { element.scrollIntoView(); }
}

window.pieNoSumChanged = function () {
  localStorage.pieNoSum = pieNoSum.checked ? '1' : '0';
  location.hash = '';
  location.reload();
}

window.runCustomSql = function () {
  const customQuery = prompt("Введите SQL запрос", localStorage.sql || "SELECT * FROM RaiffTxns;");
  if (customQuery !== null) {
    localStorage.sql = customQuery;
    results.innerHTML = '';

    dashboard({ [customQuery]: customQuery });
    document.querySelector("#nav").innerHTML = '';
  }
}







window.getQueries = async function () {
  const dashboardSQL = await fetch(dashboardSQLPath).then((response) => response.text())
  const [initQuery, ...dash] = dashboardSQL.split('\n-- ')
  const queries = { initQuery: initQuery };

  dash.forEach(item => {
    const [name, ...lines] = item.split('\n');
    const query = lines.join('\n').trim();
    if (query !== '') {
      queries[name] = query;
    }
  });

  return queries
}

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
  scroll();
}

window.query = function (sqlQuery) {
  const result = window.db.exec(sqlQuery);
  if (result.length === 0) { return null; }

  const { columns, values } = result[result.length - 1];
  return { columns, values };
}

window.initDatabase = function (initQuery) {
  window.db.exec(`CREATE TABLE RaiffTxns (id TEXT PRIMARY KEY, sum REAL NOT NULL, rsum REAL NOT NULL, curr TEXT NOT NULL, kat1 TEXT NOT NULL, kat2 TEXT, date DATE NOT NULL, type TEXT NOT NULL, card TEXT NOT NULL, ref TEXT, ref2 TEXT, acc TEXT NOT NULL);`);
  window.db.exec(`CREATE TABLE WoltItems (id INTEGER, total REAL NOT NULL, date DATE NOT NULL, shop TEXT NOT NULL, curr TEXT NOT NULL, count INTEGER NOT NULL, item TEXT NOT NULL, price REAL NOT NULL);`);
  window.db.exec(`CREATE TABLE GlovoOrders (date DATE NOT NULL, shop TEXT NOT NULL, price REAL NOT NULL);`);

  for (let file of Object.keys(localStorage).filter(k => k.endsWith('.json'))) {
    const { transactions = [], orders = [], glovo = [] } = JSON.parse(localStorage[file]);

    for (let account in transactions) {
      for (let tx of transactions[account][0][1]) {
        const date = formatDateString(tx[3]);
        const ref = tx[6] === tx[14] ? tx[6] : tx[6] + " " + tx[14];
        const sum = tx[8] === '0' ? parseFloat(tx[9]) : -1 * parseFloat(tx[8]);
        const [kat1, kat2] = parseRef(ref.toLowerCase());
        const curr = tx[2];
        const txn = [tx[7], sum, sum * ratesRsd[curr], curr, kat1, kat2, date, tx[13], tx[5], ref, tx[11], account]
        window.db.exec("INSERT OR IGNORE INTO RaiffTxns (id, sum, rsum, curr, kat1, kat2, date, type, card, ref, ref2, acc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", txn);
      }
    }

    for (let { order_number, venue_name, payment_time, items, currency, total_price, status } of orders) {
      if (status !== 'delivered') { continue; }
      const shop = venue_name;
      const datetime = formatDateTime(new Date(payment_time['$date']));
      for (let { count, name, price } of items) {
        const order = [parseInt(order_number), total_price / 100, datetime, shop, currency, count, name, price / 100];
        window.db.exec("INSERT INTO WoltItems (id, total, date, shop, curr, count, item, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", order);
      }
    }

    for (let { creationTime, storeName, pricingBreakdown } of glovo) {
      const total = pricingBreakdown.lines.filter(i => i.type === "TOTAL")[0].amount;
      if (!total.includes(" дин.")) { continue; }
      const price = +total.replaceAll(".", "").replace(",", ".").split(" ")[0];
      const datetime = formatDateTime(new Date(creationTime));
      window.db.exec("INSERT INTO GlovoOrders (date, shop, price) VALUES (?, ?, ?);", [datetime, storeName, price]);
    }
  }

  window.db.exec(initQuery);
}

window.init = async function () {
  const SQL = await initSqlJs({});
  window.db = new SQL.Database();

  const { initQuery, ...queries } = await getQueries();
  initDatabase(initQuery);
  dashboard(queries);
}

window.save = function (key, value) {

  localStorage[key] = value;
  location.hash = '';
  location.reload();


}

window.extensionActive = function () {
  document.querySelector("#extension").style.display = '';
}


function Init() {
  useEffect(() => {
    if (window.inited) { return; }
    window.inited = true;



    window.results = document.querySelector("#results");
    window.fileinput = document.querySelector('input[type=file]');
    window.pieNoSum = document.querySelector('#pieNoSum');
    window.ls = document.querySelector('#ls');

    pieNoSum.checked = localStorage.pieNoSum === '1';
    printLs();

    fileinput.addEventListener('change', ({ target }) => {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = ({ target }) => save(file.name, target.result);
      reader.readAsText(file);
    });


    init();
  }, [])
}

navigator?.serviceWorker?.register('/sw.js');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Init />
    <Header />
  </React.StrictMode >
);