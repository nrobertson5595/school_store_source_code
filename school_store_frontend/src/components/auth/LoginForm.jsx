import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from './AuthWrapper';
import { SchoolBanner, SchoolMascot, BookIcon, GraduationCapIcon, StarIcon } from '../shared/SchoolTheme';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
        } catch (err) {
            setError(err.message || 'Invalid credentials!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--gradient-primary)' }}>
            <div className="w-full max-w-md space-y-6">
                {/* School Banner */}
                <div className="animate-in fade-in duration-1000">
                    <SchoolBanner
                        title="Welcome Back!"
                        subtitle="Sign in to access your School Store account"
                        mascot={true}
                        className="text-center"
                    />
                </div>

                {/* Login Card */}
                <Card className="card-academic animate-in fade-in duration-1000 delay-300 border-2 border-blue-200 shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-school-primary rounded-full bounce-animation shadow-lg">
                                <BookIcon className="text-white w-10 h-10" animated={true} />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold font-display text-school" style={{ color: 'var(--school-blue)' }}>
                            School Store Login
                        </CardTitle>
                        <CardDescription className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
                            Ready to learn and earn? Let's get started!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <label htmlFor="username" className="flex items-center text-sm font-semibold" style={{ color: 'var(--school-blue)' }}>
                                        <GraduationCapIcon className="mr-2 w-5 h-5" animated={false} />
                                        Username
                                    </label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="h-12 text-base border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        style={{ borderColor: 'var(--border)' }}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="password" className="flex items-center text-sm font-semibold" style={{ color: 'var(--school-blue)' }}>
                                        <span className="mr-2">🔐</span>
                                        Password
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 text-base border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        style={{ borderColor: 'var(--border)' }}
                                    />
                                </div>
                                {error && (
                                    <div className="flex items-center p-3 text-red-700 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-300">
                                        <span className="mr-2">⚠️</span>
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-bold btn-school-primary hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                                disabled={loading}
                                style={{ background: 'var(--gradient-primary)', border: 'none' }}
                            >
                                <StarIcon className="mr-2 w-5 h-5" animated={loading} />
                                {loading ? 'Signing you in...' : 'Sign In to School Store'}
                            </Button>
                        </form>

                        {/* Educational Footer */}
                        <div className="pt-6 border-t border-gray-200 text-center">
                            <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    <span>🌟</span>
                                    <span>Earn Points</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span>🛍️</span>
                                    <span>Shop Rewards</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span>🏆</span>
                                    <span>Achieve Goals</span>
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                <span className="mr-1">💡</span>
                                Your educational journey starts here!
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* School Mascot at bottom */}
                <div className="flex justify-center animate-in fade-in duration-1000 delay-500">
                    <SchoolMascot size="lg" animated={true} className="opacity-80" />
                </div>
            </div>
        </div>
    );
};

export default LoginForm;