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
            <nav id="nav">{Object.keys(queries).map(text => <a key={text} href={"#" + encodeURIComponent(text)}>{text}</a>)}</nav >
            {Object.entries(queries).map(([item, queryText]) => (
                <DashboardItem key={item} item={item} queryText={queryText} db={db} hideSum={hideSum} />
            ))}
        </>
    );
}