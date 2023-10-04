import React, { useEffect } from 'react';
import DashboardItem from './DashboardItem';

export default function Dashboard({ queriesState }) {
    useEffect(() => {
        window.Prism.highlightAll();

        const elem = document.getElementById(decodeURIComponent(window.location.hash.substring(1)));
        if (elem) {
            elem.scrollIntoView();
        }
    }, [queriesState]);

    return (
        <>
            {Object.entries(queriesState).map(([item, queryText]) => (
                <DashboardItem key={item} item={item} queryText={queryText} />
            ))}
        </>
    );
}