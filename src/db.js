export const ratesRsd = { "RSD": 1, "EUR": 117, "USD": 110 };

export function formatDateString(date) {
    const [d, m, y] = date.split(' ')[0].split('.');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export function formatDateTime(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function parseRef(ref) {
    for (let type in window.patterns) {
        for (let key in window.patterns[type]) {
            if (ref.includes(key)) {
                return [type, window.patterns[type][key]];
            }
        }
    }
    return ["other", ref];
}

function getQueries() {
    const [initQuery, ...dash] = window.dashboardSQL.split('\n-- ')
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

export async function getDB() {
    const { initQuery, ...queries } = getQueries();
    const SQL = await window.initSqlJs({});
    const db = new SQL.Database();

    db.exec(`CREATE TABLE RaiffTxns (id TEXT PRIMARY KEY, sum REAL NOT NULL, rsum REAL NOT NULL, curr TEXT NOT NULL, kat1 TEXT NOT NULL, kat2 TEXT, date DATE NOT NULL, type TEXT NOT NULL, card TEXT NOT NULL, ref TEXT, ref2 TEXT, acc TEXT NOT NULL);`);
    db.exec(`CREATE TABLE WoltItems (id INTEGER, total REAL NOT NULL, date DATE NOT NULL, shop TEXT NOT NULL, curr TEXT NOT NULL, count INTEGER NOT NULL, item TEXT NOT NULL, price REAL NOT NULL);`);
    db.exec(`CREATE TABLE GlovoOrders (date DATE NOT NULL, shop TEXT NOT NULL, price REAL NOT NULL);`);

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
                db.exec("INSERT OR IGNORE INTO RaiffTxns (id, sum, rsum, curr, kat1, kat2, date, type, card, ref, ref2, acc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", txn);
            }
        }

        for (let { order_number, venue_name, payment_time, items, currency, total_price, status } of orders) {
            if (status !== 'delivered') { continue; }
            const shop = venue_name;
            const datetime = formatDateTime(new Date(payment_time['$date']));
            for (let { count, name, price } of items) {
                const order = [parseInt(order_number), total_price / 100, datetime, shop, currency, count, name, price / 100];
                db.exec("INSERT INTO WoltItems (id, total, date, shop, curr, count, item, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", order);
            }
        }

        for (let { creationTime, storeName, pricingBreakdown } of glovo) {
            const total = pricingBreakdown.lines.filter(i => i.type === "TOTAL")[0].amount;
            if (!total.includes(" дин.")) { continue; }
            const price = +total.replaceAll(".", "").replace(",", ".").split(" ")[0];
            const datetime = formatDateTime(new Date(creationTime));
            db.exec("INSERT INTO GlovoOrders (date, shop, price) VALUES (?, ?, ?);", [datetime, storeName, price]);
        }
    }

    db.exec(initQuery);

    function run(query, ui) {
        try {
            db.create_function('UI', ui);
            const result = db.exec(query);
            return result.length === 0 ? null : result[result.length - 1];
        } catch (error) {
            return { error };
        }
    }

    return { run, queries };
}
