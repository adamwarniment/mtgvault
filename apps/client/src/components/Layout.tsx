import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Book, Sparkles, Home, ChevronLeft, ChevronRight } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/10 to-gray-950 flex">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 z-50 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-60' : 'w-16'
                    }`}
            >
                {/* Logo Section */}
                <div className="p-4 border-b border-gray-800/50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all flex-shrink-0">
                            <Book className="w-5 h-5 text-white" />
                        </div>
                        {sidebarExpanded && (
                            <div className="overflow-hidden">
                                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                                    MTG Vault
                                </h1>
                                <p className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                    <Sparkles className="w-3 h-3" />
                                    Premium Collection
                                </p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-2">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive('/')
                            ? 'bg-purple-600/20 text-purple-400'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        <Home className="w-5 h-5 flex-shrink-0" />
                        {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
                    </Link>
                </nav>

                {/* Bottom Section */}
                <div className="p-3 border-t border-gray-800/50 space-y-2">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}
                        className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
                    >
                        {sidebarExpanded ? (
                            <>
                                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium whitespace-nowrap">Collapse</span>
                            </>
                        ) : (
                            <ChevronRight className="w-5 h-5 flex-shrink-0" />
                        )}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`flex-1 relative z-10 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'ml-60' : 'ml-16'
                    }`}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;
