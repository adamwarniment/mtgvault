import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeProvider';
import { LogOut, Book, Sparkles, Home, ChevronLeft, ChevronRight, Settings, Sun, Moon } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode; allowScroll?: boolean }> = ({ children, allowScroll = false }) => {
    const { logout } = useAuth();
    const { themeMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row fixed inset-0 transition-colors duration-300"
            style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            }}
        >
            {/* Subtle Texture Background */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                backgroundImage: `url("https://www.transparenttextures.com/patterns/diagmonds-light.png")`,
                backgroundSize: 'auto',
                filter: 'invert(var(--texture-invert))'
            }}></div>

            {/* Gradient Overlay using theme variables */}
            <div className="fixed inset-0 pointer-events-none transition-colors duration-300"
                style={{
                    background: `linear-gradient(to bottom right, var(--gradient-from), var(--gradient-via), var(--gradient-to))`
                }}
            ></div>

            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col h-full backdrop-blur-xl border-r z-50 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-60' : 'w-16'
                    }`}
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)'
                }}
            >
                {/* Logo Section */}
                <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all flex-shrink-0">
                            <Book className="w-5 h-5 text-white" />
                        </div>
                        {sidebarExpanded && (
                            <div className="overflow-hidden">
                                <h1 className="text-lg font-bold text-white whitespace-nowrap">
                                    MTG Vault
                                </h1>
                                <p className="text-xs flex items-center gap-1 whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                                    <Sparkles className="w-3 h-3" />
                                    Premium Collection
                                </p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive('/')
                            ? 'bg-blue-600/10 text-blue-400'
                            : 'hover:text-white transition-colors'
                            }`}
                        style={{ color: isActive('/') ? undefined : 'var(--text-secondary)' }}
                    >
                        <Home className="w-5 h-5 flex-shrink-0" />
                        {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
                    </Link>
                    <Link
                        to="/discover"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive('/discover')
                            ? 'bg-blue-600/10 text-blue-400'
                            : 'hover:text-white transition-colors'
                            }`}
                        style={{ color: isActive('/discover') ? undefined : 'var(--text-secondary)' }}
                    >
                        <Sparkles className="w-5 h-5 flex-shrink-0" />
                        {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Discover</span>}
                    </Link>
                </nav>

                {/* Bottom Section */}
                <div className="p-3 border-t space-y-2 flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
                    </button>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}
                        className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
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

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-xl border-b z-50 px-4 flex items-center justify-between"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)'
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Book className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white">
                            MTG Vault
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSettings(true)}
                        className={`p-2 rounded-lg transition-all`}
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <Link
                        to="/discover"
                        className={`p-2 rounded-lg transition-all ${isActive('/discover')
                            ? 'text-blue-400 bg-blue-500/10'
                            : ''
                            }`}
                        style={{ color: isActive('/discover') ? undefined : 'var(--text-secondary)' }}
                    >
                        <Sparkles className="w-5 h-5" />
                    </Link>
                    <Link
                        to="/"
                        className={`p-2 rounded-lg transition-all ${isActive('/')
                            ? 'text-blue-400 bg-blue-500/10'
                            : ''
                            }`}
                        style={{ color: isActive('/') ? undefined : 'var(--text-secondary)' }}
                    >
                        <Home className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <main
                className={`flex-1 relative z-10 pt-16 md:py-0 h-full ${allowScroll ? 'overflow-auto' : 'overflow-hidden'}`}
            >
                {children}
            </main>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
                    style={{ backgroundColor: 'var(--bg-overlay)' }}
                >
                    <div className="w-full max-w-md rounded-xl border shadow-xl p-6"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-primary)'
                        }}
                    >
                        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h2>

                        <div className="space-y-4">
                            {/* Theme Toggle */}
                            <div>
                                <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
                                    Theme Mode
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => toggleTheme()}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${themeMode === 'dark'
                                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                                            : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                        style={{
                                            borderColor: themeMode === 'dark' ? undefined : 'var(--border-primary)',
                                            color: themeMode === 'dark' ? undefined : 'var(--text-secondary)'
                                        }}
                                    >
                                        <Moon className="w-5 h-5" />
                                        <span className="font-medium">Dark</span>
                                    </button>
                                    <button
                                        onClick={() => toggleTheme()}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${themeMode === 'light'
                                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                                            : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                        style={{
                                            borderColor: themeMode === 'light' ? undefined : 'var(--border-primary)',
                                            color: themeMode === 'light' ? undefined : 'var(--text-secondary)'
                                        }}
                                    >
                                        <Sun className="w-5 h-5" />
                                        <span className="font-medium">Light</span>
                                    </button>
                                </div>
                            </div>

                            {/* Account Section */}
                            <div>
                                <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
                                    Account
                                </label>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 rounded-lg font-medium transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '0.8';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
