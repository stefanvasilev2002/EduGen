// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import DocumentsPage from "./pages/documents/DocumentsPage";
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';
import DocumentEdit from "./components/document/DocumentEdit";
import DocumentUpload from "./components/document/DocumentUpload";

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Private Routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    </PrivateRoute>
                } />

                <Route path="/documents" element={
                    <PrivateRoute>
                        <DashboardLayout>
                            <DocumentsPage />
                        </DashboardLayout>
                    </PrivateRoute>
                } />

                <Route path="/documents/upload" element={
                    <PrivateRoute>
                        <DashboardLayout>
                            <DocumentUpload />
                        </DashboardLayout>
                    </PrivateRoute>
                } />

                <Route path="/documents/edit/:id" element={
                    <PrivateRoute>
                        <DashboardLayout>
                            <DocumentEdit />
                        </DashboardLayout>
                    </PrivateRoute>
                } />

                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;