import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, BookOpen } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await register(name, email, password, role);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            {/* Left Side - Image/Branding */}
            <div className="hidden md:flex md:w-1/2 relative bg-primary-900 items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/auth-hero.png"
                        alt="Digital Learning Abstract"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/60 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg ring-1 ring-white/30">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">LMS Engine</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                        Start your <br />
                        <span className="text-emerald-400">learning journey</span> today.
                    </h1>
                    <p className="text-lg text-primary-100/90 leading-relaxed font-medium">
                        Join an elite structured academic environment designed for high-performance students and dedicated instructors.
                    </p>
                </div>
            </div>

            {/* Right Side - Form Layout */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-slate-50/80 relative">
                {/* Mobile Background Elements */}
                <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20 md:hidden"></div>
                <div className="absolute top-0 -right-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none md:hidden"></div>

                <div className="mx-auto w-full max-w-sm lg:max-w-md relative z-10 animate-fade-in">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an account</h2>
                        <p className="mt-2 text-sm font-medium text-slate-600">
                            Already have an account?{' '}
                            <a href="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                                Sign in here
                            </a>
                        </p>
                    </div>

                    <div className="glass-panel p-8 sm:p-10 z-20 relative">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Full Name</label>
                                <div className="mt-2">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-field"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-sm font-semibold text-slate-700">I am a...</label>
                                <div className="mt-2 relative">
                                    <select
                                        id="role"
                                        name="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="input-field appearance-none"
                                    >
                                        <option value="STUDENT">Student</option>
                                        <option value="INSTRUCTOR">Instructor</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary py-4 text-lg font-bold shadow-primary-500/40"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <UserPlus size={20} /> Create Account
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
