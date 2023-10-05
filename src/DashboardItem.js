import React, { useEffect, useState, useContext } from 'react';
import { Context } from './Context';
import DataElement from './DataElement';

const config = {
    month: {
        displayName: "Дата",
        get: value => value.slice(0, 7),
        Filter: Select
    },
    kat: {
        displayName: "Категория",
        get: value => value,
        Filter: Select
    }
}

function Select({ displayName, opts, selected, setSelected }) {
    const onChange = (e) => { setSelected(e.target.value); }

    return <div>
        {displayName}:
        <select value={selected} onChange={onChange}>
            <option value={null}>all</option>
            {opts.map(val => <option key={val} value={val}>{val}</option>)}
        </select>
    </div>;
}

export default function DashboardItem({ name, query }) {
    function getOptions() {
        const sets = {};

        db.run(query, (name, value) => {
            sets[name] = sets[name] || new Set();
            sets[name].add(config[name].get(value));
            return true;
        });

        return Object.fromEntries(Object.entries(sets).map(([name, set]) => ([name, Array.from(set).sort()])));
    }

    const { db } = useContext(Context);
    const [options] = useState(getOptions());
    const [df, setDf] = useState(null);
    const [filter, setFilter] = useState({});

    useEffect(() => {
        setDf(db.run(query, (name, value) => !filter[name] || filter[name] === config[name].get(value)));
    }, [db, query, filter]);

    return (
        <div>
            <h3 id={name}>{name}</h3>
            <pre><code className="language-sql">{query}</code></pre>
            {Object.entries(options).map(([name, opts]) => {
                const cfg = config[name];
                return <cfg.Filter key={name} displayName={config[name].displayName}
                    opts={opts} selected={filter[name]} setSelected={val => setFilter({ ...filter, [name]: val })} />
            })}
            <DataElement df={df} name={name} />
        </div>
    );
}
