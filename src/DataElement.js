import React from 'react';

import Pie from './Pie';
import Plot from './Plot';
import Table from './Table';

export default function DataElement({ df, name, hideSum }) {
    if (!df || df.values.length === 0) {
        return <div>Нет данных</div>
    } else if (df.columns.length === 2 && df.columns[0] === 'date') {
        return <Plot df={df} title={name} />;
    } else if (df.columns.length === 2 && df.columns[1] === 'total') {
        return <Pie df={df} title={name} hideSum={hideSum} />;
    } else {
        return <Table df={df} />;
    }
}
