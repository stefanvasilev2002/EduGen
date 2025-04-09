import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import DocumentsPage from "./pages/documents/DocumentsPage";
import DocumentEdit from './components/document/DocumentEdit';
import './App.css';
import TestConnection from "./components/test/TestConnection";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard route */}
                <Route path="/dashboard" element={
                    <DashboardLayout>
                        <Dashboard />
                    </DashboardLayout>
                } />

                {/* Document routes */}
                <Route path="/documents" element={
                    <DashboardLayout>
                        <DocumentsPage />
                    </DashboardLayout>
                }>
                    <Route path="upload" element={null} />
                </Route>

                {/* Document edit route */}
                <Route path="/documents/edit/:id" element={
                    <DashboardLayout>
                        <DocumentEdit />
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