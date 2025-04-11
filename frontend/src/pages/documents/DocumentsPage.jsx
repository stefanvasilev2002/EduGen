import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiUpload, FiList } from 'react-icons/fi';
import DocumentUpload from '../../components/document/DocumentUpload';
import DocumentList from '../../components/document/DocumentList';
import { DocumentService } from '../../services';
import { useAuth } from '../../components/auth/AuthContext.js';

const DocumentsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState(
        location.pathname === '/documents/upload' ? 'upload' : 'list'
    );
    const [documentToPreview, setDocumentToPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
        }
    }, [isAuthenticated, navigate, location]);

    useEffect(() => {
        if (location.pathname === '/documents/upload') {
            setActiveTab('upload');
        } else if (location.pathname === '/documents') {
            setActiveTab('list');
        }
    }, [location.pathname]);

    useEffect(() => {
        const previewId = searchParams.get('preview');
        if (previewId && !documentToPreview && isAuthenticated) {
            loadDocumentPreview(previewId);
        }
    }, [searchParams, isAuthenticated]);

    const loadDocumentPreview = async (documentId) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await DocumentService.getById(documentId);
            if (response.data) {
                setDocumentToPreview(response.data);
            }
        } catch (error) {
            console.error("Error loading document for preview:", error);
            setError("Failed to load document preview. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(tab === 'upload' ? '/documents/upload' : '/documents');
    };

    const handleClosePreview = () => {
        setDocumentToPreview(null);
        navigate('/documents');
    };

    const handleUploadSuccess = () => {
        setActiveTab('list');
        navigate('/documents');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Document Management</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="mb-6 border-b border-gray-200">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => handleTabChange('list')}
                        className={`py-4 px-6 flex items-center text-sm font-medium ${
                            activeTab === 'list'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <FiList className={`mr-2 ${activeTab === 'list' ? 'text-blue-500' : 'text-gray-400'}`} />
                        My Documents
                    </button>
                    <button
                        onClick={() => handleTabChange('upload')}
                        className={`py-4 px-6 flex items-center text-sm font-medium ${
                            activeTab === 'upload'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <FiUpload className={`mr-2 ${activeTab === 'upload' ? 'text-blue-500' : 'text-gray-400'}`} />
                        Upload Document
                    </button>
                </nav>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'list' ? (
                        <DocumentList
                            userId={currentUser?.id}
                            previewDocumentId={documentToPreview?.id}
                            onClosePreview={handleClosePreview}
                        />
                    ) : (
                        <DocumentUpload
                            userId={currentUser?.id}
                            onUploadSuccess={handleUploadSuccess}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default DocumentsPage;