import React, { useEffect, useState, useContext } from 'react';
import { Context } from './Context';
import DataElement from './DataElement';

export default function DashboardItem({ name, query }) {
    const { db } = useContext(Context);
    const [df, setDf] = useState(null);
    const [filterValues, setFilterValues] = useState([]);
    const [selected, setSelected] = useState('all');
    const handleDateChange = (e) => { setSelected(e.target.value); }

    useEffect(() => {
        const usedDates = new Set();

        const result = db.run(query, {
            dt(val) {
                const value = val.slice(0, 7);
                usedDates.add(value);
                return selected === 'all' || selected === value;
            }
        });

        setDf(result.length === 0 ? null : result[result.length - 1]);

        if (usedDates.size > 0) { setFilterValues(["all", ...Array.from(usedDates).sort()]); }

        if (filterValues.length === 0) { setFilterValues(Array.from(usedDates).sort()); }
    }, [name, query, selected, filterValues.length, db]);

    return (
        <div>
            <h3 id={name}>{name}</h3>
            <pre><code className="language-sql">{query}</code></pre>
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
            <DataElement df={df} name={name} />
        </div>
    );
}
