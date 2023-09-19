import os
import sqlite3
import json
from datetime import datetime
import pandas as pd
import plotly.express as px
from IPython.display import display
import re


def dashboard(items):
    queries = get_queries()
    for item in items:
        query_text = queries[item] if item in queries else item
        df = query(query_text)
        if df is None or len(df) == 0:
            continue

        columns = df.columns.tolist()
        if len(columns) == 2 and columns[0] == 'date':
            df["date"] = pd.to_datetime(df["date"])
            df = df.sort_values(by="date")
            complete_df = pd.DataFrame({"date": pd.date_range(
                df["date"].min(), df["date"].max(), freq="D")})
            df = pd.merge(complete_df, df, on="date", how="left").fillna(0)

            fig = px.line(df, x='date', y=columns[1], title=item)
            fig.update_layout(xaxis_title="", yaxis_title="")
            display(fig)
        elif len(columns) == 2 and columns[1] == 'total':
            fig = px.pie(df, names=columns[0],
                         values='total', title=item)
            fig.update_traces(textinfo='value+percent')
            display(fig)
        else:
            print(item)
            display(df)


def get_queries():
    pattern = re.compile(
        r'-- (?P<name>[\w\s]+)\n(?P<query>(?:[^-]|-(?!-))+)', re.DOTALL)
    queries = {}
    with open("dashboard.sql", 'r') as file:
        content = file.read()

    for match in pattern.finditer(content):
        queries[match.group('name')] = match.group('query')
    return queries


def parse_ref(ref):
    for type in patterns:
        for key in patterns[type]:
            if key in ref:
                return (type, patterns[type][key])
    return ("other", ref)


def query(sql_query):
    c.execute(sql_query)
    if c.description is None:
        return

    return pd.DataFrame(list(c.fetchall()), columns=[column[0] for column in c.description])


pd.set_option('display.max_rows', 100)
with open('patterns.json', 'r') as file:
    patterns = json.load(file)
rates_rsd = {"RSD": 1, "EUR": 117, "USD": 110}

txns = []
for file in [n for n in os.listdir('.') if n.startswith("Raiff_") and n.endswith(".json")]:
    with open(file, 'r') as file:
        data = json.load(file)

    for account in data['transactions']:
        for tx in data['transactions'][account][0][1]:
            date = datetime.strptime(
                tx[3], '%d.%m.%Y %H:%M:%S').date().strftime('%Y-%m-%d')
            ref = tx[6] if tx[6] == tx[14] else tx[6] + " " + tx[14]
            sum = float(tx[9]) if tx[8] == '0' else -1 * float(tx[8])
            (kat1, kat2) = parse_ref(ref)
            curr = tx[2]

            txns.append((tx[7], sum, sum * rates_rsd[curr], curr,
                        kat1, kat2, date, tx[13], tx[5], ref, tx[11], account))

conn = sqlite3.connect(':memory:')
c = conn.cursor()
c.execute('''CREATE TABLE TX (id TEXT PRIMARY KEY, sum REAL NOT NULL, rsum REAL NOT NULL, curr TEXT NOT NULL, kat1 TEXT NOT NULL,
    kat2 TEXT, date DATE NOT NULL, type TEXT NOT NULL, card TEXT NOT NULL, ref TEXT, ref2 TEXT, acc TEXT NOT NULL);''')
c.executemany('''INSERT OR IGNORE INTO TX (id, sum, rsum, curr, kat1, kat2, date, type, card, ref, ref2, acc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);''', txns)
c.executescript(get_queries()['init'])
conn.commit()
