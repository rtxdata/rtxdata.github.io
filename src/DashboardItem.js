import React, { useEffect, useState, useCallback, useRef } from 'react';

export default function DashboardItem({ item, queryText }) {
    const [filterValues, setFilterValues] = useState([]);
    const [selected, setSelected] = useState('all');
    const handleDateChange = useCallback((e) => { setSelected(e.target.value); }, [setSelected]);

    const elementRef = useRef(null);

    useEffect(() => {
        const usedDates = new Set();

        const overrides = {
            dt(val) {
                const value = val.slice(0, 7);
                usedDates.add(value);
                return selected === 'all' || selected === value;
            }
        };

        elementRef.current.innerHTML = '';
        elementRef.current.appendChild(window.dataElement(queryText, item, overrides));

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
            <div ref={elementRef} />
        </div>
    );
}

