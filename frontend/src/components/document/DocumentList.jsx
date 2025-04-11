import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiSearch,
    FiChevronDown,
    FiChevronUp,
    FiTrash2,
    FiEdit,
    FiEye,
    FiFileText,
    FiRefreshCw,
    FiAlertCircle,
    FiUpload,
    FiDownload,
    FiExternalLink, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { DocumentService } from '../../services';
import { useAuth } from '../auth/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';

const DocumentList = ({ previewDocumentId, onClosePreview }) => {
    const { isAuthenticated, currentUser } = useAuth();
    const navigate = useNavigate();
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'uploadedDate',
        direction: 'desc'
    });
    const [previewDocument, setPreviewDocument] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [previewContent, setPreviewContent] = useState(null);
    const [previewMetadata, setPreviewMetadata] = useState(null);
    const [previewMode, setPreviewMode] = useState('info');

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/documents' } });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (previewDocumentId && !previewDocument && documents.length > 0) {
            const docToPreview = documents.find(doc => doc.id === parseInt(previewDocumentId, 10));
            if (docToPreview) {
                handlePreview(docToPreview);
            }
        }
    }, [previewDocumentId, documents]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchDocuments();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        let result = [...documents];

        if (searchQuery) {
            result = result.filter(doc =>
                doc.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedLanguage) {
            result = result.filter(doc => doc.language === selectedLanguage);
        }

        if (selectedType) {
            result = result.filter(doc => doc.type === selectedType);
        }

        if (selectedFormat) {
            result = result.filter(doc => doc.format === selectedFormat);
        }

        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredDocuments(result);
    }, [documents, searchQuery, selectedLanguage, selectedType, selectedFormat, sortConfig]);

    useEffect(() => {
        if (previewMode === 'view' && previewDocument?.format === 'PDF') {
            const viewUrl = `${window.location.origin}/api/documents/${previewDocument.id}/view`;
            console.log('PDF Viewer URL:', viewUrl);
            console.log('Document ID:', previewDocument.id);
            console.log('Full document object:', previewDocument);
        }
    }, [previewMode, previewDocument]);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await DocumentService.getAll();
            setDocuments(response.data || []);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('Failed to load documents. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (type, value) => {
        switch (type) {
            case 'language':
                setSelectedLanguage(value);
                break;
            case 'type':
                setSelectedType(value);
                break;
            case 'format':
                setSelectedFormat(value);
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedLanguage('');
        setSelectedType('');
        setSelectedFormat('');
    };

    const handlePreview = async (document) => {
        setPreviewDocument(document);
        setPreviewLoading(true);
        setPreviewError(null);
        setPreviewContent(null);
        setPreviewMetadata(null);
        setPreviewMode('info');

        try {
            const metadataResponse = await DocumentService.getDocumentMetadata(document.id);
            setPreviewMetadata(metadataResponse.data);

            if (['PDF', 'TXT', 'DOCX'].includes(document.format)) {
                try {
                    const contentResponse = await DocumentService.getDocumentContent(document.id);
                    setPreviewContent(contentResponse.data);
                } catch (err) {
                    console.log('Preview content not available:', err);
                }
            }
        } catch (err) {
            console.error('Error fetching document preview data:', err);
            setPreviewError('Failed to load preview information. Please try again.');
        } finally {
            setPreviewLoading(false);
        }
    };

    const closePreview = () => {
        setPreviewDocument(null);
        setPreviewContent(null);
        setPreviewMetadata(null);
        setPreviewError(null);
        setPreviewMode('info');

        if (onClosePreview) {
            onClosePreview();
        }
    };

    const switchPreviewMode = (mode) => {
        setPreviewMode(mode);
    };

    const handleDelete = (document) => {
        setDocumentToDelete(document);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (documentToDelete) {
            try {
                await DocumentService.deleteDocument(documentToDelete.id);
                setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
                setShowDeleteModal(false);
                setDocumentToDelete(null);

                if (previewDocument && previewDocument.id === documentToDelete.id) {
                    closePreview();
                }
            } catch (err) {
                console.error('Error deleting document:', err);
                setError('Failed to delete document. Please try again.');
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDocumentToDelete(null);
    };

    const handleDownload = async (documentId) => {
        try {
            const response = await DocumentService.downloadDocument(documentId);

            const blob = new Blob([response.data], {
                type: response.headers['content-type']
            });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            console.log(contentDisposition)
            const filename = contentDisposition ?
                contentDisposition.split('filename=')[1].replace(/"/g, '') :
                `document-${documentId}`;

            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading document:', err);
            setError('Failed to download document. Please try again.');
        }
    };

    const getLanguageName = (code) => {
        const languageMap = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'mk': 'Macedonian'
        };
        return languageMap[code] || code;
    };

    const getDocumentTypeName = (type) => {
        return type.charAt(0) + type.slice(1).toLowerCase();
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc'
                ? <FiChevronUp className="ml-1 inline" />
                : <FiChevronDown className="ml-1 inline" />;
        }
        return null;
    };
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const changePage = (offset) => {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    };

    const previousPage = () => {
        changePage(-1);
    };

    const nextPage = () => {
        changePage(1);
    };
    if (!isAuthenticated) {
        return null;
    }


    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Documents</h2>

            {/* Search and filters */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-row gap-2">
                    <div className="relative">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => handleFilterChange('language', e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Languages</option>
                            {/* Language options */}
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="mk">Macedonian</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <FiChevronDown className="text-gray-400" />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedType}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Types</option>
                            {/* Document type options */}
                            <option value="LECTURE">Lecture</option>
                            <option value="BOOK">Book</option>
                            <option value="ARTICLE">Article</option>
                            <option value="NOTES">Notes</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <FiChevronDown className="text-gray-400" />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedFormat}
                            onChange={(e) => handleFilterChange('format', e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Formats</option>
                            {/* Format options */}
                            <option value="PDF">PDF</option>
                            <option value="DOCX">DOCX</option>
                            <option value="TXT">TXT</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <FiChevronDown className="text-gray-400" />
                        </div>
                    </div>

                    <button
                        onClick={clearFilters}
                        className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        title="Clear filters"
                    >
                        <FiRefreshCw />
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <FiAlertCircle className="mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading indicator */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Documents table */}
                    {filteredDocuments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        onClick={() => handleSort('title')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                            <span className="flex items-center">
                                                Title
                                                {getSortIcon('title')}
                                            </span>
                                    </th>
                                    <th
                                        onClick={() => handleSort('language')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                            <span className="flex items-center">
                                                Language
                                                {getSortIcon('language')}
                                            </span>
                                    </th>
                                    <th
                                        onClick={() => handleSort('type')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                            <span className="flex items-center">
                                                Type
                                                {getSortIcon('type')}
                                            </span>
                                    </th>
                                    <th
                                        onClick={() => handleSort('format')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                            <span className="flex items-center">
                                                Format
                                                {getSortIcon('format')}
                                            </span>
                                    </th>
                                    <th
                                        onClick={() => handleSort('uploadedDate')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                            <span className="flex items-center">
                                                Uploaded Date
                                                {getSortIcon('uploadedDate')}
                                            </span>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDocuments.map((document) => (
                                    <tr key={document.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FiFileText className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                                <div className="text-sm font-medium text-gray-900">
                                                    {document.title}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getLanguageName(document.language)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    {getDocumentTypeName(document.type)}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {document.format}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(document.uploadedDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handlePreview(document)}
                                                className="inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-full"
                                                title="Preview"
                                            >
                                                <FiEye />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(document.id)}
                                                className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full"
                                                title="Download"
                                            >
                                                <FiDownload />
                                            </button>
                                            <Link
                                                to={`/documents/edit/${document.id}`}
                                                className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full"
                                                title="Edit"
                                            >
                                                <FiEdit />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(document)}
                                                className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full"
                                                title="Delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
                            <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery || selectedLanguage || selectedType || selectedFormat
                                    ? 'Try clearing your filters or adding new documents'
                                    : 'Get started by uploading your first document'}
                            </p>
                            <Link
                                to="/documents/upload"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <FiUpload className="mr-2 -ml-1 h-4 w-4" />
                                Upload Document
                            </Link>
                        </div>
                    )}
                </>
            )}

            {/* Enhanced Document Preview Modal */}
            {previewDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Document: {previewDocument.title}
                            </h3>
                            <button
                                onClick={closePreview}
                                className="text-gray-400 hover:text-gray-500 text-2xl font-medium"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Preview tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => switchPreviewMode('info')}
                                    className={`py-4 px-6 flex items-center text-sm font-medium ${
                                        previewMode === 'info'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <FiFileText className={`mr-2 ${previewMode === 'info' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    Information
                                </button>
                                <button
                                    onClick={() => switchPreviewMode('content')}
                                    disabled={!previewContent}
                                    className={`py-4 px-6 flex items-center text-sm font-medium ${
                                        previewMode === 'content'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : !previewContent
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <FiEye className={`mr-2 ${previewMode === 'content' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    Content Preview
                                </button>
                                {previewMetadata?.canView && (
                                    <button
                                        onClick={() => switchPreviewMode('view')}
                                        className={`py-4 px-6 flex items-center text-sm font-medium ${
                                            previewMode === 'view'
                                                ? 'border-b-2 border-blue-500 text-blue-600'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <FiExternalLink className={`mr-2 ${previewMode === 'view' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        View Document
                                    </button>
                                )}
                            </nav>
                        </div>

                        <div className="p-4 flex-grow overflow-auto">
                            {previewLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : previewError ? (
                                <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                                    <FiAlertCircle className="mr-2" />
                                    <span>{previewError}</span>
                                </div>
                            ) : (
                                <>
                                    {/* Information View */}
                                    {previewMode === 'info' && previewMetadata && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-base font-medium text-gray-800 mb-4">Document Details</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Title</p>
                                                        <p className="font-medium">{previewMetadata.title}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Format</p>
                                                        <p className="font-medium">{previewMetadata.format}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Type</p>
                                                        <p className="font-medium">{getDocumentTypeName(previewMetadata.type)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Language</p>
                                                        <p className="font-medium">{getLanguageName(previewMetadata.language)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-base font-medium text-gray-800 mb-4">File Information</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Upload Date</p>
                                                        <p className="font-medium">{formatDate(previewMetadata.uploadedDate)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">File Size</p>
                                                        <p className="font-medium">{formatFileSize(previewMetadata.fileSize)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Capabilities</p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {previewMetadata.canPreview && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                                    Content Preview
                                                                </span>
                                                            )}
                                                            {previewMetadata.canView && (
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                    In-Browser Viewing
                                                                </span>
                                                            )}
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                                Download
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Preview */}
                                    {previewMode === 'content' && previewContent && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border border-gray-200 max-h-[500px] overflow-auto">
                                                {previewContent}
                                            </div>
                                        </div>
                                    )}

                                    {previewMode === 'view' && previewMetadata?.canView && (
                                        <div className="h-[600px] bg-gray-50 flex flex-col items-center justify-center">
                                            {previewDocument.format === 'PDF' ? (
                                                <div className="w-full h-full flex flex-col">
                                                    <div className="flex-grow overflow-auto flex justify-center">
                                                        <Document
                                                            file={`${window.location.origin}/api/documents/${previewDocument.id}/view`}
                                                            onLoadSuccess={onDocumentLoadSuccess}
                                                            loading={
                                                                <div className="flex items-center justify-center h-64">
                                                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                                                                </div>
                                                            }
                                                            error={
                                                                <div className="text-center text-red-500">
                                                                    <p>Failed to load PDF. Please try downloading instead.</p>
                                                                </div>
                                                            }
                                                        >
                                                            <Page
                                                                pageNumber={pageNumber}
                                                                width={Math.min(800, window.innerWidth * 0.8)}
                                                            />
                                                        </Document>
                                                    </div>

                                                    {numPages > 1 && (
                                                        <div className="flex items-center justify-center py-3 bg-white border-t">
                                                            <button
                                                                onClick={previousPage}
                                                                disabled={pageNumber <= 1}
                                                                className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FiChevronLeft className="w-5 h-5" />
                                                            </button>
                                                            <span className="mx-4 text-sm">
                                                                Page {pageNumber} of {numPages}
                                                            </span>
                                                            <button
                                                                onClick={nextPage}
                                                                disabled={pageNumber >= numPages}
                                                                className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FiChevronRight className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : previewDocument.format === 'TXT' ? (
                                                <div className="w-full h-full bg-white p-4 overflow-auto">
                                                    <pre className="whitespace-pre-wrap">{previewContent}</pre>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                    <p className="text-gray-500 mb-4">This document type cannot be viewed directly in the browser.</p>
                                                    <button
                                                        onClick={() => handleDownload(previewDocument.id)}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <FiDownload className="mr-2" />
                                                        Download Document
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(previewDocument.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                >
                                    <FiDownload className="mr-2" />
                                    Download
                                </button>
                                {previewMetadata?.canView && (
                                    <button
                                        onClick={() => {
                                            const baseUrl = window.location.origin;
                                            window.open(`${baseUrl}/documents/${previewDocument.id}/view`, '_blank');
                                        }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                                    >
                                        <FiExternalLink className="mr-2" />
                                        Open in New Tab
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={closePreview}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                        </div>
                        <div className="p-4">
                            <p className="mb-4">
                                Are you sure you want to delete "<span className="font-medium">{documentToDelete?.title}</span>"?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentList;