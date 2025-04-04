import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import DocumentPage from "./pages/documents/DocumentsPage";
import './App.css';
import TestConnection from "./components/test/TestConnection";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard and document routes */}
                <Route path="/dashboard" element={
                    <DashboardLayout>
                        <Dashboard />
                    </DashboardLayout>
                } />

                <Route path="/documents" element={
                    <DashboardLayout>
                        <DocumentPage />
                    </DashboardLayout>
                } />

                <Route path="/test" element={
                    <TestConnection/>
                } />

                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;