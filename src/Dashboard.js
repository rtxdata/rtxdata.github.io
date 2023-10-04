import React, { useEffect } from 'react';
import DashboardItem from './DashboardItem';

export default function Dashboard({ db, queries, hideSum }) {
    useEffect(() => {
        window.Prism.highlightAll();

        const elem = document.getElementById(decodeURIComponent(window.location.hash.substring(1)));
        if (elem) { elem.scrollIntoView(); }
    }, [db]);

    return (
        <>
            <nav id="nav">
                {Object.keys(queries).map(name => <a key={name} href={"#" + encodeURIComponent(name)}>{name}</a>)}
            </nav>
            {Object.entries(queries).map(([name, query]) => (
                <DashboardItem key={name} name={name} query={query} db={db} hideSum={hideSum} />
            ))}
        </>
    );
}