import React, { useEffect, useRef } from 'react';

export default function DataElement({ df, name }) {
    const elementRef = useRef(null);

    useEffect(() => {
        elementRef.current.innerHTML = '';

        if (!df || df.values.length === 0) {
            elementRef.current.appendChild(window.element('Нет данных'));
        } else if (df.columns.length === 2 && df.columns[0] === 'date') {
            elementRef.current.appendChild(window.datePlotElement(df, name));
        } else if (df.columns.length === 2 && df.columns[1] === 'total') {
            elementRef.current.appendChild(window.totalPieElement(df, name));
        } else {
            elementRef.current.appendChild(window.tableElement(df, name));
        }
    }, [df, name]);

    return <div ref={elementRef} />;
}
