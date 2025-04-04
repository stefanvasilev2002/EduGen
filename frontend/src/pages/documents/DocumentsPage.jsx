import React from 'react';
import DocumentUpload from '../../components/document/DocumentUpload';

const DocumentPage = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Document Management</h1>
            <div className="grid grid-cols-1 gap-6">
                <DocumentUpload />
            </div>
        </div>
    );
};

export default DocumentPage;