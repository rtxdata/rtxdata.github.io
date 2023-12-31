import React from 'react';

import Pie from './Pie';
import Plot from './Plot';
import Table from './Table';

export default function DataElement({ df, name }) {
    if (df && df.error) {
        console.error(df.error);
        return <div>{String(df.error)}</div>
    } else if (!df || df.values.length === 0) {
        return <div>Нет данных</div>
    } else if (df.columns.length === 2 && df.columns[0] === 'date') {
        return <Plot df={df} title={name} />;
    } else if (df.columns.length === 2 && df.columns[1] === 'total') {
        return <Pie df={df} title={name} />;
    } else {
        return <Table df={df} />;
    }
}
