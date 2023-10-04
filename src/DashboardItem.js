import React, { useEffect, useState, useCallback } from 'react';

import DataElement from './DataElement';

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
            <pre><code className="language-sql">{queryText}</code></pre>
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

