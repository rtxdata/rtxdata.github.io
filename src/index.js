import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from './Context';
import './index.css';

navigator?.serviceWorker?.register('/sw.js');

async function init() {
    window.dashboardSQL = await fetch(process.env.PUBLIC_URL + "/dashboard.sql").then((response) => response.text());
    window.patterns = await fetch(process.env.PUBLIC_URL + "/patterns.json").then((response) => response.json());

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<React.StrictMode><Provider><App /></Provider></React.StrictMode >);
}

init();
