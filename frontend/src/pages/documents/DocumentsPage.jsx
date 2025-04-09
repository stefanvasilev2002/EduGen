import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiUpload, FiList } from 'react-icons/fi';
import DocumentUpload from '../../components/document/DocumentUpload';
import DocumentList from '../../components/document/DocumentList';
import { DocumentService } from '../../services';

const DocumentsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(
        location.pathname === '/documents/upload' ? 'upload' : 'list'
    );
    const [documentToPreview, setDocumentToPreview] = useState(null);

    useEffect(() => {
        if (location.pathname === '/documents/upload') {
            setActiveTab('upload');
        } else if (location.pathname === '/documents') {
            setActiveTab('list');
        }
    }, [location.pathname]);

    useEffect(() => {
        const previewId = searchParams.get('preview');
        if (previewId && !documentToPreview) {
            loadDocumentPreview(previewId);
        }
    }, [searchParams]);

    const loadDocumentPreview = async (documentId) => {
        try {
            const response = await DocumentService.getById(documentId);
            if (response.data) {
                setDocumentToPreview(response.data);
            }
        } catch (error) {
            console.error("Error loading document for preview:", error);
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

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Document Management</h1>

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

            {activeTab === 'list' ? (
                <DocumentList previewDocumentId={documentToPreview?.id} onClosePreview={handleClosePreview} />
            ) : (
                <DocumentUpload />
            )}
        </div>
    );
};

export default DocumentsPage;