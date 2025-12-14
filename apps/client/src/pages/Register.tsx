import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Book, Sparkles, UserPlus } from 'lucide-react';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/register', { email, password });
            login(response.data.token);
            navigate('/');
        } catch (err) {
            setError('Registration failed. Email might already be in use.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
            background: `linear-gradient(to bottom right, var(--bg-primary), var(--gradient-via), var(--bg-primary))`
        }}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'var(--orb-1)' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000" style={{ backgroundColor: 'var(--orb-2)' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50 mb-4">
                        <Book className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        MTG Vault
                    </h1>
                    <p className="flex items-center justify-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <Sparkles className="w-4 h-4" />
                        Your Premium Card Collection
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="w-6 h-6" />
                            Create Account
                        </CardTitle>
                        <CardDescription>Start organizing your collection today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Must be at least 6 characters</p>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>
                        <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs mt-6" style={{ color: 'var(--text-tertiary)' }}>
                    By creating an account, you agree to keep your collection awesome
                </p>
            </div>
        </div>
    );
};

export default Register;
