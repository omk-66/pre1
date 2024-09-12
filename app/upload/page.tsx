'use client';

import { useState } from 'react';
import Papa from 'papaparse';

const UploadPage = () => {
    const [columns, setColumns] = useState([]);
    const [dataTypes, setDataTypes] = useState({});
    const [fileData, setFileData] = useState(null);

    // Handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    const parsedColumns = Object.keys(results.data[0]);
                    setColumns(parsedColumns);
                    setFileData(results.data);
                }
            });
        }
    };

    // Handle data type selection for each column
    const handleDataTypeChange = (column, event) => {
        setDataTypes((prev) => ({
            ...prev,
            [column]: event.target.value
        }));
    };

    // Send data and column info to server for dynamic schema generation
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Make sure data types are set for all columns
        if (columns.length > 0 && Object.keys(dataTypes).length === columns.length) {
            try {
                const response = await fetch('/api/generate-schema', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ columns, dataTypes, fileData })
                });
                const result = await response.json();
                console.log(result.message); // Response from the server
            } catch (error) {
                console.error('Error sending data:', error);
            }
        } else {
            alert('Please select data types for all columns!');
        }
    };

    return (
        <div>
            <h1>Upload CSV/Excel File</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
                {columns.length > 0 && (
                    <div>
                        <h3>Select Data Types for Each Column:</h3>
                        {columns.map((column) => (
                            <div key={column}>
                                <label>{column}</label>
                                <select onChange={(event) => handleDataTypeChange(column, event)}>
                                    <option value="String">String</option>
                                    <option value="Int">Integer</option>
                                    <option value="Float">Float</option>
                                    <option value="Boolean">Boolean</option>
                                    <option value="DateTime">DateTime</option>
                                </select>
                            </div>
                        ))}
                        <button type="submit">Submit</button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default UploadPage;
