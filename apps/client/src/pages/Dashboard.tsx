import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, BookOpen, Layers, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

interface Binder {
    id: string;
    name: string;
    layout: string;
    cards: any[];
}

const Dashboard: React.FC = () => {
    const [binders, setBinders] = useState<Binder[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newBinderName, setNewBinderName] = useState('');
    const [newBinderLayout, setNewBinderLayout] = useState('GRID_3x3');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBinders();
    }, []);

    const fetchBinders = async () => {
        try {
            const response = await api.get('/binders');
            setBinders(response.data);
        } catch (error) {
            console.error('Failed to fetch binders');
        }
    };

    const createBinder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/binders', { name: newBinderName, layout: newBinderLayout });
            setShowModal(false);
            setNewBinderName('');
            fetchBinders();
        } catch (error) {
            console.error('Failed to create binder');
        } finally {
            setLoading(false);
        }
    };

    const getLayoutDisplay = (layout: string) => {
        return layout.replace('GRID_', '').replace('x', ' × ');
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-3">My Binders</h1>
                    <p className="text-gray-400">Organize and manage your Magic: The Gathering collection</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Total Binders</p>
                                    <p className="text-3xl font-bold text-white">{binders.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Total Cards</p>
                                    <p className="text-3xl font-bold text-white">
                                        {binders.reduce((sum, b) => sum + b.cards.length, 0)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-pink-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-300 mb-1">Quick Action</p>
                                    <Button
                                        onClick={() => setShowModal(true)}
                                        size="sm"
                                        className="mt-2"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Binder
                                    </Button>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-purple-300" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Binders Grid */}
                {binders.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No binders yet</h3>
                            <p className="text-gray-400 mb-6">Create your first binder to start organizing your collection</p>
                            <Button onClick={() => setShowModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Binder
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {binders.map((binder) => (
                            <Link
                                key={binder.id}
                                to={`/binder/${binder.id}`}
                                className="group"
                            >
                                <Card className="h-full transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center group-hover:from-purple-600/30 group-hover:to-pink-600/30 transition-all">
                                                <BookOpen className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded-md text-gray-400">
                                                {getLayoutDisplay(binder.layout)}
                                            </span>
                                        </div>
                                        <CardTitle className="group-hover:text-purple-400 transition-colors">
                                            {binder.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {binder.cards.length} {binder.cards.length === 1 ? 'card' : 'cards'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
                                            Open binder
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Create Binder Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Create New Binder</CardTitle>
                                <CardDescription>Choose a name and layout for your binder</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={createBinder} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Binder Name</label>
                                        <Input
                                            type="text"
                                            value={newBinderName}
                                            onChange={(e) => setNewBinderName(e.target.value)}
                                            placeholder="My Awesome Collection"
                                            required
                                            disabled={loading}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Layout</label>
                                        <select
                                            value={newBinderLayout}
                                            onChange={(e) => setNewBinderLayout(e.target.value)}
                                            className="flex h-11 w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            disabled={loading}
                                        >
                                            <option value="GRID_2x2">2 × 2 (4 cards per page)</option>
                                            <option value="GRID_3x3">3 × 3 (9 cards per page)</option>
                                            <option value="GRID_4x3">4 × 3 (12 cards per page)</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            variant="ghost"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Creating...' : 'Create Binder'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
