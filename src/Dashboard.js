import React, { useEffect } from 'react';
import DashboardItem from './DashboardItem';

export default function Dashboard({ db, hideSum }) {
    useEffect(() => {
        window.Prism.highlightAll();

        const elem = document.getElementById(decodeURIComponent(window.location.hash.substring(1)));
        if (elem) {
            elem.scrollIntoView();
        }
    }, [db]);

    if (!db) { return null; }

    return (
        <>
            <nav id="nav">{Object.keys(db.queries).map(text => <a key={text} href={"#" + encodeURIComponent(text)}>{text}</a>)}</nav >
            {Object.entries(db.queries).map(([item, queryText]) => (
                <DashboardItem key={item} item={item} queryText={queryText} db={db.db} hideSum={hideSum} />
            ))}
        </>
    );
}