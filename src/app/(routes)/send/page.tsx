"use client"
import { useState } from 'react';
import Papa from 'papaparse';
import ImageOverlay from '@/components/image-editor';

interface TableRow {
  email: string;
  [key: string]: string; // var1, var2, etc. will be dynamic
}

export default function Page() {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [columns, setColumns] = useState<string[]>(['email', 'var1', 'var2']);

  // Handle manual data entry
  const handleInputChange = (rowIndex: number, column: string, value: string) => {
    const updatedData = [...tableData];
    updatedData[rowIndex][column] = value;
    setTableData(updatedData);
  };

  // Add new variable column
  const addColumn = () => {
    const newColumn = `var${columns.length}`;
    setColumns([...columns, newColumn]);
  };

  // Add new row
  const addRow = () => {
    const newRow: TableRow = { email: '', var1: '', var2: '' };
    columns.slice(3).forEach(col => newRow[col] = '');
    setTableData([...tableData, newRow]);
  };

  // Handle CSV upload and parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const data = results.data;
          const csvColumns = Object.keys(data[0]);
          setColumns(csvColumns);
          setTableData(data);
        },
      });
    }
  };

  return (
    <div className="container">
      <h1>CertiSend - Enter Data or Upload CSV</h1>

      <div>
        <h2>Manual Data Entry</h2>
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>

        <table>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={row[col] || ''}
                      onChange={(e) => handleInputChange(rowIndex, col, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Upload CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </div>

      <ImageOverlay columns={columns} tableData={tableData} />
    </div>
  );
}
