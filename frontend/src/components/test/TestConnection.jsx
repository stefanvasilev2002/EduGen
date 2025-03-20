import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TestConnection() {
    const [backendStatus, setBackendStatus] = useState('Checking backend connection...');
    const [dbStatus, setDbStatus] = useState('Checking database connection...');
    const [backendError, setBackendError] = useState(null);
    const [dbError, setDbError] = useState(null);

    useEffect(() => {
        // Test backend connection
        axios.get('/api/test')
            .then(response => {
                setBackendStatus('Connected to backend: ' + response.data.message);
            })
            .catch(err => {
                setBackendError('Failed to connect to backend: ' + err.message);
            });

        // Test database connection
        axios.get('/api/test/db')
            .then(response => {
                if (response.data.status === 'success') {
                    setDbStatus(`Database connected! Entity created with ID ${response.data.entityId}. Total entities: ${response.data.entityCount}`);
                } else {
                    setDbError('Database test returned error: ' + response.data.message);
                }
            })
            .catch(err => {
                setDbError('Failed to test database connection: ' + err.message);
            });
    }, []);

    return (
        <div style={{ textAlign: 'left', margin: '20px' }}>
            <h2>Connection Tests</h2>

            <div style={{ marginBottom: '20px' }}>
                <h3>Backend API</h3>
                {backendError ? (
                    <p style={{ color: 'red' }}>{backendError}</p>
                ) : (
                    <p style={{ color: 'green' }}>{backendStatus}</p>
                )}
            </div>

            <div>
                <h3>Database</h3>
                {dbError ? (
                    <p style={{ color: 'red' }}>{dbError}</p>
                ) : (
                    <p style={{ color: 'green' }}>{dbStatus}</p>
                )}
            </div>
        </div>
    );
}

export default TestConnection;