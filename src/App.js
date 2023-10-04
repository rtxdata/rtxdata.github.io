import React, { useState } from 'react';
import CustomSql from './CustomSql';
import ExtensionButtons from './ExtensionButtons';
import Storage from './Storage';
import HideSum from './HideSum';
import Dashboard from './Dashboard';


export default function App() {
    const [overrides, setOverrides] = useState(null);

    return <>
        <h3><a href="#rtxdata">RtxData</a></h3>
        <div className="content">
            Анализ данных из Райфайзен Банка (Сербия)
            <CustomSql setOverrides={setOverrides} />
        </div>
        <ExtensionButtons />
        <Storage />
        <HideSum />
        <Dashboard overrides={overrides} />
    </>;
}
