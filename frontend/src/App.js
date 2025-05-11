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
import { AuthProvider } from './components/auth/AuthContext';
import QuestionsPage from "./pages/questions/QuestionsPage";
import GenerateQuestionsPage from "./pages/questions/GenerateQuestionsPage";
import QuestionForm from "./components/question/QuestionForm";
import QuizPage from "./pages/quiz/QuizPage"; // Import the new QuizPage

function App() {
    return (
        <AuthProvider>
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
                                <DocumentsPage />
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

                    <Route path="/questions" element={
                        <PrivateRoute>
                            <DashboardLayout>
                                <QuestionsPage />
                            </DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/questions/create" element={
                        <PrivateRoute>
                            <DashboardLayout>
                                <QuestionForm />
                            </DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/questions/edit/:id" element={
                        <PrivateRoute>
                            <DashboardLayout>
                                <QuestionForm />
                            </DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/questions/generate" element={
                        <PrivateRoute>
                            <DashboardLayout>
                                <GenerateQuestionsPage />
                            </DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/quiz" element={
                        <PrivateRoute>
                            <DashboardLayout>
                                <QuizPage />
                            </DashboardLayout>
                        </PrivateRoute>
                    } />

                    {/* Fallback for unknown routes */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;