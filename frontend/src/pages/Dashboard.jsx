import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiFileText,
    FiUpload,
    FiActivity,
} from 'react-icons/fi';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalDocuments: 0,
        recentDocuments: []
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                // In production, you would use real API calls
                // For now, we'll use simulated data

                // Simulated data for demonstration
                setTimeout(() => {
                    setStats({
                        totalDocuments: 4,
                        recentDocuments: [
                            { id: 1, title: 'Spring Boot Introduction', uploadedDate: '2023-05-15T10:30:00', format: 'PDF' },
                            { id: 2, title: 'Web Development Fundamentals', uploadedDate: '2023-05-12T14:20:00', format: 'DOCX' },
                            { id: 3, title: 'Database Systems Overview', uploadedDate: '2023-05-10T09:15:00', format: 'PDF' },
                            { id: 4, title: 'React State Management', uploadedDate: '2023-05-08T16:45:00', format: 'TXT' }
                        ]
                    });
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const quickActions = [
        {
            title: 'Upload Document',
            description: 'Add a new document to generate questions',
            icon: <FiUpload className="h-6 w-6 text-blue-500" />,
            path: '/documents',
            color: 'bg-blue-50'
        },
        {
            title: 'View Documents',
            description: 'Browse your uploaded documents',
            icon: <FiFileText className="h-6 w-6 text-purple-500" />,
            path: '/documents',
            color: 'bg-purple-50'
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <Link
                    to="/documents"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    <FiUpload className="mr-2 h-4 w-4" />
                    Upload New Document
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Quick actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className={`p-6 rounded-lg shadow-sm ${action.color} hover:shadow-md transition-shadow`}
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">{action.icon}</div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-800">{action.title}</h3>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Document statistics */}
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-medium text-gray-800">Document Statistics</h2>
                        </div>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 mr-4">
                                <FiFileText className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalDocuments}</p>
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
                                            Upload Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.recentDocuments.map((document) => (
                                        <tr key={document.id}>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(document.uploadedDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">
                                                    View
                                                </a>
                                                <a href="#" className="text-red-600 hover:text-red-900">
                                                    Delete
                                                </a>
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
                                    to="/documents"
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