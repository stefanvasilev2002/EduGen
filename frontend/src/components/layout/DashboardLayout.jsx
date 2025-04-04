import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiFileText,
    FiMenu,
    FiX,
    FiUser
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', icon: <FiHome className="mr-3 h-5 w-5" />, path: '/dashboard' },
        { name: 'Documents', icon: <FiFileText className="mr-3 h-5 w-5" />, path: '/documents' },
    ];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 bg-white shadow-lg">
                    {/* Logo and brand */}
                    <div className="flex items-center justify-center h-16 bg-blue-600">
                        <span className="text-white text-xl font-bold">EduGen</span>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col flex-grow p-4">
                        <nav className="flex-1 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                                        isActive(item.path)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar */}
            <div
                className={`md:hidden fixed inset-0 z-40 flex transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out`}
            >
                {/* Sidebar */}
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-lg">
                    {/* Close button */}
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={toggleSidebar}
                        >
                            <FiX className="h-6 w-6 text-white" />
                        </button>
                    </div>

                    {/* Logo and navigation */}
                    <div className="flex items-center justify-center h-16 bg-blue-600">
                        <span className="text-white text-xl font-bold">EduGen</span>
                    </div>

                    <div className="flex-1 h-0 overflow-y-auto">
                        <nav className="px-4 pt-4 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                                        isActive(item.path)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={toggleSidebar}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Overlay */}
                <div className="flex-shrink-0 w-14" onClick={toggleSidebar}></div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top navigation */}
                <div className="flex items-center justify-between h-16 bg-white shadow-sm px-4 md:px-6">
                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-500 focus:outline-none"
                        onClick={toggleSidebar}
                    >
                        <FiMenu className="h-6 w-6" />
                    </button>

                    <div className="flex-1 flex justify-between items-center ml-4">
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-gray-800">EduGen</h1>
                        </div>

                        {/* User profile */}
                        <div className="flex items-center ml-4">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                <FiUser className="h-4 w-4" />
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">User</span>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;