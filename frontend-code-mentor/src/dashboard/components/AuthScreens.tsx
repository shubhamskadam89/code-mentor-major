import { useState } from 'react'
import { Mail, Lock, User as UserIcon, ArrowRight, Github, Code2 } from 'lucide-react'
import { useAuth } from '../../modules/auth/context/AuthContext'

interface AuthScreensProps {
    onLoginSuccess: (handle: string, role: string) => void;
}

export function AuthScreens({ onLoginSuccess }: AuthScreensProps) {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [handle, setHandle] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const url = isLogin
                ? 'http://localhost:8080/api/auth/login'
                : 'http://localhost:8080/api/auth/register';

            const payload = isLogin
                ? { email, password }
                : {
                    name: email.split('@')[0],
                    email,
                    password,
                    role: role.toUpperCase(),
                    handle
                };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.data?.token) {
                const t = data.data.token;
                const h = data.data.handle || data.data.name || data.data.email.split('@')[0];
                const r = data.data.role.toLowerCase();
                const em = data.data.email;

                await login(h, em, r as 'student' | 'teacher', t);
                onLoginSuccess(h, r);
            } else {
                throw new Error(data.message || 'Authentication failed');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };
    const loginWithGoogle = () => {
        setIsLoading(true);
        setError('');
        
        if (typeof chrome === 'undefined' || !chrome.identity || !chrome.identity.getAuthToken) {
            // Redirect web app directly to Spring Boot OAuth2 endpoint
            window.location.href = 'http://localhost:8080/oauth2/authorization/google';
            return;
        }

        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
            if (chrome.runtime.lastError || !token) {
                setError(chrome.runtime.lastError?.message || 'Google login failed');
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch('http://localhost:8080/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        googleToken: token,
                        role: role
                    })
                });
                const data = await res.json();

                if (res.ok && data.data?.token) {
                    const t = data.data.token;
                    const h = data.data.name || data.data.email.split('@')[0];
                    const r = data.data.role.toLowerCase();
                    const em = data.data.email || '';

                    await login(h, em, r as 'student' | 'teacher', t);
                    onLoginSuccess(h, r);
                } else {
                    throw new Error(data.message || 'Google login failed');
                }
            } catch (err: any) {
                setError(err.message || 'Authentication failed');
            } finally {
                setIsLoading(false);
            }
        });
    };

    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white selection:bg-orange-500/30 font-sans">
            {/* Left/Top Decor Section */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 dark:bg-zinc-900/50 p-12 flex-col justify-between relative overflow-hidden border-r border-zinc-200 dark:border-zinc-800">
                <div className="relative z-10 w-full">
                    <div className="flex items-center space-x-3 mb-16">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-500/20">
                            🦊
                        </div>
                        <span className="font-extrabold text-3xl font-sans tracking-tight text-white">CodeMentor</span>
                    </div>

                    <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-6">
                        Master your <br />
                        <span className="text-orange-500">Coding Journey.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md">
                        Track your statistics across LeetCode, HackerRank, and GeeksForGeeks. Receive AI-driven insights to accelerate your career.
                    </p>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative z-10 p-6 bg-zinc-800/50 backdrop-blur-md rounded-2xl border border-zinc-700/50 flex items-start space-x-4 max-w-md">
                    <div className="p-3 bg-zinc-800 rounded-lg shrink-0">
                        <Code2 className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-1">Extension Active</h3>
                        <p className="text-sm text-zinc-400">Join thousands of students syncing their portfolio autonomously while they code.</p>
                    </div>
                </div>
            </div>

            {/* Right: Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Mobile Header visible only on small screens */}
                <div className="absolute top-8 left-8 flex items-center space-x-2 lg:hidden">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        🦊
                    </div>
                </div>

                <div className="w-full max-w-md space-y-8">
                    {/* Role selection */}
                    <div className="flex justify-center mb-4">
                        <label className="mr-4 flex items-center">
                            <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="mr-2" />
                            Student
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} className="mr-2" />
                            Teacher
                        </label>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            {isLogin
                                ? 'Enter your details to access your dashboard.'
                                : 'Start tracking your coding portfolio instantly.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-500/20">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Platform Handle (e.g., LeetCode Username)</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="shubhamskadam89"
                                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all dark:placeholder-zinc-600"
                                        value={handle}
                                        onChange={(e) => setHandle(e.target.value)}
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all dark:placeholder-zinc-600"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
                                {isLogin && (
                                    <button type="button" className="text-sm font-medium text-orange-600 dark:text-orange-500 hover:text-orange-500">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all dark:placeholder-zinc-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-zinc-500 dark:border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-zinc-50 dark:bg-black text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" className="flex items-center justify-center space-x-2 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-medium">
                            <Github className="w-5 h-5" />
                            <span>GitHub</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => loginWithGoogle()}
                            disabled={isLoading}
                            className="flex items-center justify-center space-x-2 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-medium">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google</span>
                        </button>
                    </div>

                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-bold text-orange-600 dark:text-orange-500 hover:text-orange-500 hover:underline transition-all"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
