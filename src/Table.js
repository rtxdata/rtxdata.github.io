import React from 'react';

export default function Table({ df }) {
    return (
        <table>
            <thead>
                <tr>
                    {df.columns.map((header, idx) => (
                        <th key={idx}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {df.values.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((value, valueIndex) => (
                            <td key={valueIndex}>{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
