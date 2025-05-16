import React from 'react';
import { FiShield, FiUser, FiLock, FiDatabase, FiGlobe, FiFileText, FiMail, FiCheckCircle } from 'react-icons/fi';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
                <FiShield className="h-6 w-6 text-blue-500" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Overview</h2>
                    <FiGlobe className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
                <p className="text-gray-600">
                    This Privacy Policy describes how EduGen ("we", "us", or "our") collects, uses, and discloses your
                    information when you use our service. We are committed to protecting your privacy and ensuring
                    the security of your personal information.
                </p>
            </div>

            {/* Information Collection Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-3 rounded-full bg-blue-100 mr-4">
                            <FiUser className="h-6 w-6 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-800">Information We Collect</h2>
                    </div>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Account information when you register (name, email, password)</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Profile information that you provide (profile picture, educational details)</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Content you upload, including documents and their metadata</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Usage data about how you interact with our services</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-3 rounded-full bg-purple-100 mr-4">
                            <FiLock className="h-6 w-6 text-purple-500" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-800">How We Use Information</h2>
                    </div>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Provide, maintain, and improve our educational services</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Process and generate questions from your uploaded documents</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Communicate with you about our services, updates, and features</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Monitor and analyze trends, usage, and activities on our platform</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Google Drive Integration */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Google Drive Integration</h2>
                    <FiFileText className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-gray-600 mb-4">
                    Our service offers integration with Google Drive to allow you to import documents directly from your account.
                    Here's how we handle this integration:
                </p>
                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-indigo-100 mr-3 mt-1">
                            <FiCheckCircle className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-800 mb-1">Limited Access</h3>
                            <p className="text-sm text-gray-600">
                                We only access files you explicitly select to import. We do not browse, index, or access any other files in your Google Drive.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-indigo-100 mr-3 mt-1">
                            <FiCheckCircle className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-800 mb-1">No Stored Credentials</h3>
                            <p className="text-sm text-gray-600">
                                We do not store your Google credentials. Authentication is handled through Google's OAuth 2.0 protocol, which provides temporary access tokens.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="p-2 rounded-full bg-indigo-100 mr-3 mt-1">
                            <FiCheckCircle className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-800 mb-1">File Transfer</h3>
                            <p className="text-sm text-gray-600">
                                When you select a file, it is downloaded to our service and stored according to our general data storage policies. You can disconnect Google Drive access at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Security */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-3 rounded-full bg-green-100 mr-4">
                            <FiDatabase className="h-6 w-6 text-green-500" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-800">Data Security</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        We implement appropriate security measures to protect your personal information:
                    </p>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>All data is encrypted during transmission using TLS</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Secure storage of documents and user data</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Regular security audits and updates</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Limited employee access to personal information</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-3 rounded-full bg-red-100 mr-4">
                            <FiMail className="h-6 w-6 text-red-500" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-800">Contact Us</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="space-y-3 text-gray-600">
                        <div className="flex items-start">
                            <FiMail className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Email: vasilevstefan2002@gmail.com</span>
                        </div>
                        <div className="flex items-start">
                            <FiGlobe className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Website: edugen.onrender.com</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            By using our service, you acknowledge that you have read and understand this Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;