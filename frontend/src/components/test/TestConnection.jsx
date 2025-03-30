import React, { useState, useEffect, useRef } from 'react';
import {TestService} from "../../services";

function TestConnection() {
    const [backendStatus, setBackendStatus] = useState('Checking backend connection...');
    const [dbStatus, setDbStatus] = useState('Checking database connection...');
    const [backendError, setBackendError] = useState(null);
    const [dbError, setDbError] = useState(null);

    const requestsMadeRef = useRef(false);

    useEffect(() => {
        if (requestsMadeRef.current) return;

        console.log('Testing connection via service layer...');
        requestsMadeRef.current = true;

        // Test backend connection
        TestService.testConnection()
            .then(response => {
                console.log('Backend response:', response.data);
                setBackendStatus('Connected to backend: ' + response.data.message);
            })
            .catch(err => {
                console.error('Backend error:', err);
                setBackendError('Failed to connect to backend: ' + err.message);
            });

        // Test database connection
        TestService.testDatabaseConnection()
            .then(response => {
                console.log('Database response:', response.data);
                if (response.data.status === 'success') {
                    setDbStatus(`Database connected! Entity created with ID ${response.data.entityId}. Total entities: ${response.data.entityCount}`);
                } else {
                    setDbError('Database test returned error: ' + response.data.message);
                }
            })
            .catch(err => {
                console.error('Database error:', err);
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