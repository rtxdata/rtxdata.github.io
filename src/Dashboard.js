import React, { useEffect, useContext } from 'react';
import DashboardItem from './DashboardItem';
import { Context } from './Context';

export default function Dashboard({ overrides }) {
    const { db } = useContext(Context);
    useEffect(() => {
        window.Prism.highlightAll();

        const elem = document.getElementById(decodeURIComponent(window.location.hash.substring(1)));
        if (elem) { elem.scrollIntoView(); }
    }, [db]);

    if (!db) { return "Загрузка..."; }
    const entries = Object.entries(overrides || db.queries);

    return (
        <>
            <nav id="nav">{entries.map(([name]) => <a key={name} href={"#" + encodeURIComponent(name)}>{name}</a>)}</nav>
            {entries.map(([name, query]) => <DashboardItem key={name} name={name} query={query} />)}
        </>
    );
}