import React, { useState, useEffect } from 'react';
import { FiCloud, FiDownload } from 'react-icons/fi';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const GoogleDriveIntegration = ({ onFileSelect, setFile, setDocumentMetadata }) => {
    const [tokenClient, setTokenClient] = useState(null);
    const [gapiReady, setGapiReady] = useState(false);
    const [pickerReady, setPickerReady] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load Google Identity Services
        const loadGIS = () => {
            if (window.google?.accounts?.oauth2) {
                initializeGIS();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGIS;
            document.head.appendChild(script);
        };

        // Load Google API Platform Library
        const loadGapi = () => {
            if (window.gapi) {
                loadGapiClient();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            script.onload = loadGapiClient;
            document.head.appendChild(script);
        };

        // Initialize after both libraries are loaded
        loadGIS();
        loadGapi();

        return () => {
            // Cleanup function
            const scripts = document.querySelectorAll('script[src^="https://accounts.google.com"], script[src^="https://apis.google.com"]');
            scripts.forEach(script => {
                if (script.parentNode === document.head) {
                    script.remove();
                }
            });
        };
    }, []);

    const initializeGIS = () => {
        if (!window.google?.accounts?.oauth2) return;

        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: handleTokenResponse,
                error_callback: (error) => {
                    console.error('Token error:', error);
                    setError('Failed to get access token');
                }
            });
            setTokenClient(client);
        } catch (err) {
            console.error('Error initializing GIS:', err);
            setError('Failed to initialize Google authentication');
        }
    };

    const loadGapiClient = () => {
        window.gapi.load('client:picker', async () => {
            try {
                // Initialize gapi client without discovery docs
                await window.gapi.client.init({
                    apiKey: API_KEY,
                });
                setGapiReady(true);
                setPickerReady(true);
            } catch (err) {
                console.error('Error loading Google API client:', err);
                setError('Failed to initialize Google API');
            }
        });
    };

    const handleTokenResponse = (tokenResponse) => {
        if (tokenResponse?.access_token) {
            // Store token for use with Drive API
            sessionStorage.setItem('google_access_token', tokenResponse.access_token);
            setIsAuthorized(true);
        }
    };

    const handleSignIn = () => {
        try {
            if (tokenClient) {
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                setError('Google authentication not ready');
            }
        } catch (err) {
            console.error('Error during sign-in:', err);
            setError('Failed to sign in to Google Drive');
        }
    };

    const openPicker = () => {
        if (!gapiReady || !pickerReady || !isAuthorized) {
            setError('Google Drive integration not ready');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const accessToken = sessionStorage.getItem('google_access_token');
            if (!accessToken) {
                setError('Please sign in first');
                setIsLoading(false);
                return;
            }

            // Create the picker
            const picker = new window.google.picker.PickerBuilder()
                .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
                .setOAuthToken(accessToken)
                .setDeveloperKey(API_KEY)
                .setAppId(CLIENT_ID.split('-')[0]) // Use first part of client ID
                .addView(window.google.picker.ViewId.DOCS)
                .addView(window.google.picker.ViewId.DOCS_IMAGES)
                .setCallback(handlePickerResponse)
                .setMaxItems(1)
                .build();

            picker.setVisible(true);
            setIsLoading(false);
        } catch (err) {
            console.error('Error opening picker:', err);
            setError('Failed to open file picker');
            setIsLoading(false);
        }
    };

    const handlePickerResponse = async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
            const file = data.docs[0];
            try {
                await downloadFile(file);
            } catch (err) {
                console.error('Error downloading file:', err);
                setError('Failed to download file from Google Drive');
            }
        }
        setIsLoading(false);
    };

    const downloadFile = async (file) => {
        try {
            setIsLoading(true);
            setError(null);

            const accessToken = sessionStorage.getItem('google_access_token');
            if (!accessToken) {
                throw new Error('No access token available');
            }

            // Get file metadata
            const metadataResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${file.id}?fields=id,name,mimeType,size`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (!metadataResponse.ok) {
                throw new Error('Failed to get file metadata');
            }

            const metadata = await metadataResponse.json();
            const fileName = metadata.name;
            const fileExt = fileName.split('.').pop().toLowerCase();

            // Validate file type
            if (!['pdf', 'docx', 'txt'].includes(fileExt)) {
                setError('Unsupported file format. Please select PDF, DOCX, or TXT files.');
                return;
            }

            // Validate file size (5MB limit)
            const fileSize = parseInt(metadata.size);
            if (fileSize > 5 * 1024 * 1024) {
                setError('File is too large. Maximum size is 5MB.');
                return;
            }

            // Download file content
            const downloadResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (!downloadResponse.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await downloadResponse.blob();

            // Create File object
            const downloadedFile = new File([blob], fileName, {
                type: blob.type || getFileType(fileExt),
                lastModified: Date.now(),
            });

            // Update metadata
            const newMetadata = {
                title: fileName.replace(/\.[^/.]+$/, ''),
                language: 'en',
                type: 'LECTURE',
                format: fileExt.toUpperCase()
            };

            // Pass to parent component
            setFile(downloadedFile);
            setDocumentMetadata(newMetadata);
            onFileSelect(downloadedFile, newMetadata);

        } catch (err) {
            console.error('Error downloading file:', err);
            setError('Failed to download file from Google Drive');
        } finally {
            setIsLoading(false);
        }
    };

    const getFileType = (extension) => {
        const types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain'
        };
        return types[extension] || 'application/octet-stream';
    };

    const handleSignOut = () => {
        // Clear stored token
        sessionStorage.removeItem('google_access_token');
        setIsAuthorized(false);

        // Revoke token if possible
        const accessToken = sessionStorage.getItem('google_access_token');
        if (window.google?.accounts?.oauth2 && accessToken) {
            window.google.accounts.oauth2.revoke(accessToken, () => {
                console.log('Token revoked successfully');
            });
        }
    };

    // Loading state
    if (!gapiReady || !pickerReady || !tokenClient) {
        return (
            <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Loading Google Drive integration...</p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Import from Google Drive</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <div className="mr-2">⚠️</div>
                    {error}
                </div>
            )}

            {!isAuthorized ? (
                <button
                    onClick={handleSignIn}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <FiCloud className="mr-2" />
                    Connect to Google Drive
                </button>
            ) : (
                <div>
                    <button
                        onClick={openPicker}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 mb-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <FiDownload className="mr-2" />
                                Select from Google Drive
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full text-sm text-gray-600 hover:text-gray-800"
                    >
                        Sign out from Google Drive
                    </button>
                </div>
            )}
        </div>
    );
};

export default GoogleDriveIntegration;