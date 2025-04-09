import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiFileText,
    FiUpload,
    FiActivity,
    FiPieChart,
    FiBook,
    FiCpu,
    FiMessageSquare
} from 'react-icons/fi';
import { DocumentService } from '../services';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalDocuments: 0,
        recentDocuments: []
    });
    const [documentsByType, setDocumentsByType] = useState({});
    const [documentsByFormat, setDocumentsByFormat] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const documentsResponse = await DocumentService.getAll();
                const documents = documentsResponse.data || [];

                const recentDocumentsResponse = await DocumentService.getRecentDocuments(5);
                const recentDocuments = recentDocumentsResponse.data || [];

                const typeDistribution = {};
                const formatDistribution = {};

                documents.forEach(doc => {
                    if (typeDistribution[doc.type]) {
                        typeDistribution[doc.type]++;
                    } else {
                        typeDistribution[doc.type] = 1;
                    }

                    if (formatDistribution[doc.format]) {
                        formatDistribution[doc.format]++;
                    } else {
                        formatDistribution[doc.format] = 1;
                    }
                });

                setStats({
                    totalDocuments: documents.length,
                    recentDocuments: recentDocuments
                });
                setDocumentsByType(typeDistribution);
                setDocumentsByFormat(formatDistribution);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again later.');
                setIsLoading(false);

                setStats({
                    totalDocuments: 0,
                    recentDocuments: []
                });
            }
        };

        fetchDashboardData();
    }, []);

    const quickActions = [
        {
            title: 'Upload Document',
            description: 'Add a new document to generate questions',
            icon: <FiUpload className="h-6 w-6 text-blue-500" />,
            path: '/documents/upload',
            color: 'bg-blue-50'
        },
        {
            title: 'View Documents',
            description: 'Browse your uploaded documents',
            icon: <FiFileText className="h-6 w-6 text-purple-500" />,
            path: '/documents',
            color: 'bg-purple-50'
        },
        {
            title: 'Generate Questions',
            description: 'Create questions from your documents',
            icon: <FiMessageSquare className="h-6 w-6 text-green-500" />,
            path: '/questions/generate',
            color: 'bg-green-50'
        },
        {
            title: 'View Study Materials',
            description: 'Browse your generated questions and quizzes',
            icon: <FiBook className="h-6 w-6 text-indigo-500" />,
            path: '/questions',
            color: 'bg-indigo-50'
        }
    ];

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

    const getDocumentTypeName = (type) => {
        return type.charAt(0) + type.slice(1).toLowerCase();
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Quick actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className={`p-5 rounded-lg shadow-sm ${action.color} hover:shadow-md transition-all`}
                            >
                                <div className="flex items-center h-full">
                                    <div className="flex-shrink-0">{action.icon}</div>
                                    <div className="ml-4">
                                        <h3 className="text-base font-medium text-gray-800">{action.title}</h3>
                                        <p className="text-xs text-gray-600">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Document statistics */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-medium text-gray-800">Documents</h2>
                                <FiFileText className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 mr-4">
                                    <FiPieChart className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.totalDocuments}</p>
                                </div>
                            </div>
                        </div>

                        {/* Document Types Distribution */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-medium text-gray-800">Document Types</h2>
                                <FiActivity className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="space-y-2 mt-4">
                                {Object.entries(documentsByType).map(([type, count]) => (
                                    <div key={type} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{getDocumentTypeName(type)}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full"
                                                    style={{ width: `${(count / stats.totalDocuments) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">{count}</span>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(documentsByType).length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-2">No documents yet</p>
                                )}
                            </div>
                        </div>

                        {/* Document Formats Distribution */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-medium text-gray-800">Document Formats</h2>
                                <FiCpu className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="space-y-2 mt-4">
                                {Object.entries(documentsByFormat).map(([format, count]) => (
                                    <div key={format} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{format}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${(count / stats.totalDocuments) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">{count}</span>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(documentsByFormat).length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-2">No documents yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent documents */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-800">Recent Documents</h2>
                            <FiActivity className="h-5 w-5 text-gray-400" />
                        </div>

                        {stats.recentDocuments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Format
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Upload Date
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.recentDocuments.map((document) => (
                                        <tr key={document.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FiFileText className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {document.title}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {document.format}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    {getDocumentTypeName(document.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(document.uploadedDate)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No documents found</p>
                                <Link
                                    to="/documents/upload"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                >
                                    Upload your first document
                                </Link>
                            </div>
                        )}

                        {stats.recentDocuments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <Link to="/documents" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                    View all documents
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;