import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FiHome,
    FiFileText,
    FiMenu,
    FiX,
    FiUser,
    FiLogOut
} from 'react-icons/fi';
import { AuthService } from '../../services';
import {LuFileQuestion} from "react-icons/lu";
import {FaStickyNote} from "react-icons/fa";
import {FaBrain} from "react-icons/fa";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
    }, []);

    const navItems = [
        { name: 'Dashboard', icon: <FiHome className="h-5 w-5" />, path: '/dashboard' },
        { name: 'Documents', icon: <FiFileText className="h-5 w-5" />, path: '/documents' },
        { name: 'Generate Questions', icon: <LuFileQuestion className="h-5 w-5" />, path: '/questions/generate' },
        { name: 'View study materials', icon: <FaStickyNote className="h-5 w-5" />, path: '/questions' },
        { name: 'Take Quiz', icon: <FaBrain className="h-5 w-5" />, path: '/quiz' },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 bg-white shadow-lg">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 bg-blue-600 shadow-md">
                        <span className="text-white text-2xl font-bold tracking-wide">
                            Edu<span className="text-lime-400">Gen</span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col flex-grow p-4">
                        <nav className="flex-1 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        isActive(item.path)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                    }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* User Profile Section */}
                        <div className="mt-auto pt-4 border-t border-gray-200">
                            {currentUser && (
                                <div className="px-4 py-2">
                                    <div className="flex items-center mb-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                                            <FiUser className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{currentUser.username}</p>
                                            <p className="text-xs text-gray-500">{currentUser.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-red-500 rounded-md transition-colors"
                                    >
                                        <FiLogOut className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
                    onClick={toggleSidebar}
                />
            )}
            <div
                className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="relative flex flex-col h-full">
                    {/* Close Button */}
                    <div className="absolute top-2 right-2">
                        <button
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={toggleSidebar}
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 bg-blue-600 shadow-md">
                        <span className="text-white text-2xl font-bold tracking-wide">
                            Edu<span className="text-lime-400">Gen</span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto mt-4 px-4">
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        isActive(item.path)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                    }`}
                                    onClick={toggleSidebar}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* User Profile Section */}
                        {currentUser && (
                            <div className="mt-auto pt-4 border-t border-gray-200">
                                <div className="px-4 py-2">
                                    <div className="flex items-center mb-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                                            <FiUser className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{currentUser.username}</p>
                                            <p className="text-xs text-gray-500">{currentUser.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-red-500 rounded-md transition-colors"
                                    >
                                        <FiLogOut className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Navigation */}
                <div className="flex items-center justify-between h-16 bg-white shadow-sm px-4 md:px-6 border-b">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-500 focus:outline-none"
                        onClick={toggleSidebar}
                    >
                        <FiMenu className="h-6 w-6" />
                    </button>

                    <div className="flex-1 flex justify-between items-center ml-4">
                        <h1 className="text-lg font-semibold text-gray-800">EduGen</h1>

                        {/* User Profile */}
                        <div className="flex items-center gap-2 ml-4">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white hover:scale-105 transition-transform">
                                <FiUser className="h-4 w-4" />
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-700">
                                {currentUser?.username || 'User'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-red-500"
                                title="Logout"
                            >
                                <FiLogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;