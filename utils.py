import os
import sqlite3
import json
from datetime import datetime
import pandas as pd
import plotly.express as px
from IPython.display import display


def format_date_string(dt):
    return datetime.strptime(dt, '%d.%m.%Y %H:%M:%S').date().strftime('%Y-%m-%d')


def format_date_time(js_unixtime):
    return datetime.fromtimestamp(int(js_unixtime / 1000)).strftime('%Y-%m-%d %H:%M:%S')


def parse_ref(ref):
    for type in patterns:
        for key in patterns[type]:
            if key in ref:
                return (type, patterns[type][key])
    return ("other", ref)


def get_queries():
    init_query, *dash = dashboard_SQL.split('\n-- ')
    queries = {'init_query': init_query}

    for item in dash:
        lines = item.split('\n')
        name, *lines = lines
        query = '\n'.join(lines).strip()
        if query != '':
            queries[name] = query

    return queries


def display_date_plot(df, title):
    columns = df.columns.tolist()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(by="date")
    complete_df = pd.DataFrame({"date": pd.date_range(
        df["date"].min(), df["date"].max(), freq="D")})
    df = pd.merge(complete_df, df, on="date", how="left").fillna(0)

    fig = px.line(df, x='date', y=columns[1], title=title)
    fig.update_layout(xaxis_title="", yaxis_title="")
    display(fig)


def display_total_pie(df, title):
    columns = df.columns.tolist()
    fig = px.pie(df, names=columns[0], values='total', title=title)
    fig.update_traces(textinfo='value+percent')
    fig.update_layout(width=700)
    display(fig)


def display_table(df, title):
    print(title)
    display(df)


def dashboard(items):
    queries = get_queries()
    for item in items:
        query_text = queries[item] if item in queries else item
        df = query(query_text)
        if df is None or len(df) == 0:
            continue

        columns = df.columns.tolist()
        if len(columns) == 2 and columns[0] == 'date':
            display_date_plot(df, title=item)
        elif len(columns) == 2 and columns[1] == 'total':
            display_total_pie(df, title=item)
        else:
            display_table(df, title=item)


def query(sql_query):
    c = db.cursor()
    c.execute(sql_query)
    if c.description is None:
        return

    return pd.DataFrame(list(c.fetchall()), columns=[column[0] for column in c.description])


def init_database(init_query):
    db.execute("CREATE TABLE TX (id TEXT PRIMARY KEY, sum REAL NOT NULL, rsum REAL NOT NULL, curr TEXT NOT NULL, kat1 TEXT NOT NULL, kat2 TEXT, date DATE NOT NULL, type TEXT NOT NULL, card TEXT NOT NULL, ref TEXT, ref2 TEXT, acc TEXT NOT NULL);")

    for file in [n for n in os.listdir('.') if n.startswith("Raiff_") and n.endswith(".json")]:
        with open(file, 'r') as file:
            data = json.load(file)

        for account in data['transactions']:
            for tx in data['transactions'][account][0][1]:
                date = format_date_string(tx[3])
                ref = tx[6] if tx[6] == tx[14] else tx[6] + " " + tx[14]
                sum = float(tx[9]) if tx[8] == '0' else -1 * float(tx[8])
                (kat1, kat2) = parse_ref(ref.lower())
                curr = tx[2]
                txn = (tx[7], sum, sum * rates_rsd[curr], curr, kat1,
                       kat2, date, tx[13], tx[5], ref, tx[11], account)

                db.execute(
                    "INSERT OR IGNORE INTO TX (id, sum, rsum, curr, kat1, kat2, date, type, card, ref, ref2, acc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", txn)

    db.execute("CREATE TABLE WOLT (id INTEGER, total REAL NOT NULL, date DATE NOT NULL, shop TEXT NOT NULL, curr TEXT NOT NULL, count INTEGER NOT NULL, item TEXT NOT NULL, price REAL NOT NULL);")

    for file in [n for n in os.listdir('.') if n.startswith("Wolt_") and n.endswith(".json")]:
        with open(file, 'r') as file:
            data = json.load(file)

        for order in data['orders']:
            if order['status'] != 'delivered':
                continue

            shop = order['venue_name']
            dt = format_date_time(order['payment_time']['$date'])

            for item in order['items']:
                o = (int(order['order_number']), order['total_price'] / 100, dt, shop,
                     order['currency'], item['count'], item['name'], item['price'] / 100)

                db.execute(
                    "INSERT INTO WOLT (id, total, date, shop, curr, count, item, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", o)

    db.execute(
        "CREATE TABLE GLOVO (date DATE NOT NULL, shop TEXT NOT NULL, price REAL NOT NULL);")

    for file in [n for n in os.listdir('.') if n.startswith("Glovo_") and n.endswith(".json")]:
        with open(file, 'r') as file:
            data = json.load(file)

        for order in data['glovo']:
            for line in order['pricingBreakdown']['lines']:
                if line['type'] == 'TOTAL':
                    total = line['amount']
                    break
            if " дин." not in total:
                continue

            price = float(total.replace(
                ".", "").replace(",", ".").split(" ")[0])
            db.execute("INSERT INTO GLOVO (date, shop, price) VALUES (?, ?, ?);",
                       (format_date_time(order['creationTime']), order['storeName'], price))

    db.executescript(init_query)


rates_rsd = {"RSD": 1, "EUR": 117, "USD": 110}
pd.set_option('display.max_rows', 100)

db = sqlite3.connect(':memory:')
with open('patterns.json', 'r') as file:
    patterns = json.load(file)
with open("dashboard.sql", 'r') as file:
    dashboard_SQL = file.read()

init_database(get_queries()['init_query'])
