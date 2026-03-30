import { useState, useEffect } from 'react';
import api, { getThumbnail } from '../../services/api';
import { BookOpen, Award, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import ProfileSection from './ProfileSection';

const StudentDash = ({ currentView = 'courses' }) => {
    const [enrollments, setEnrollments] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [subjectQuizzes, setSubjectQuizzes] = useState({}); // { subjectId: [quizzes] }
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { t } = useTranslation();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrollRes, subRes, resultsRes] = await Promise.all([
                api.get('/enrollments/me'),
                api.get('/subjects'),
                api.get('/results/me')
            ]);
            setEnrollments(enrollRes.data);
            setResults(resultsRes.data);

            // Fetch quizzes for each enrolled subject
            const quizzesBySubject = {};
            for (let enrollment of enrollRes.data) {
                try {
                    const quizRes = await api.get(`/quizzes/subject/${enrollment.subjectId._id}`);
                    quizzesBySubject[enrollment.subjectId._id] = quizRes.data;
                } catch (qErr) {
                    console.error("Error fetching quizzes for subject", qErr);
                }
            }
            setSubjectQuizzes(quizzesBySubject);

            // Filter out already enrolled subjects
            const enrolledIds = enrollRes.data.map(e => e.subjectId._id);
            setAvailableSubjects(subRes.data.filter(s => !enrolledIds.includes(s._id)));
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (subjectId) => {
        try {
            await api.post(`/enrollments/${subjectId}`);
            fetchData(); // Refresh data
        } catch (error) {
            alert(error.response?.data?.message || 'Enrollment failed');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your learning space...</div>;

    const renderDashboard = () => {
        const progressData = enrollments.map((e, i) => ({
            name: e.subjectId.title?.split(' ')[0] || 'Subject',
            progress: e.percentageCompleted || 0,
            fill: ['#6366f1', '#10b981', '#f59e0b'][i % 3],
        }));

        const quizBarData = results.map((r, i) => ({
            name: `Quiz ${i + 1}`,
            score: r.percentage || 0,
        }));

        return (
            <div className="space-y-8 animate-fade-in-up">
                {/* Scholar Hero Banner */}
                <div className="relative h-48 lg:h-60 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-indigo-500/10 transition-colors duration-300">
                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80" alt="Studying" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 dark:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-surface-950/90 dark:via-surface-950/40 dark:to-transparent flex items-center px-8 lg:px-16 transition-colors duration-300">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">{t('scholar_id')}: {user?.userId || '001'}</span>
                            </div>
                            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-3">{t('welcome')}</h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-lg font-bold">{t('active_courses', { count: enrollments.length })}</p>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: t('enrolled'), value: enrollments.length, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-slate-200 dark:border-indigo-500/20', emoji: '📚' },
                        { label: t('assessments'), value: results.length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-slate-200 dark:border-emerald-500/20', emoji: '🧠' },
                        { label: t('proficiency'), value: results.length > 0 ? `${(results.reduce((a, r) => a + r.percentage, 0) / results.length).toFixed(1)}%` : '—', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-slate-200 dark:border-amber-500/20', emoji: '🏆' },
                    ].map((s, i) => (
                        <div key={i} className={`bg-white dark:bg-surface-850 p-8 rounded-[2rem] border ${s.border} hover:bg-slate-50 dark:hover:bg-surface-800 transition-all duration-500 shadow-xl group`}>
                            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center text-2xl mb-6 shadow-inner`}>{s.emoji}</div>
                            <p className={`text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter`}>{s.value}</p>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl p-8 transition-colors duration-300">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                            <TrendingUp size={14} className="text-indigo-600 dark:text-indigo-400" /> Mastery Progress
                        </h3>
                        {progressData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="100%" data={progressData} startAngle={90} endAngle={-270}>
                                    <RadialBar dataKey="progress" cornerRadius={12} background={{ fill: 'rgba(255,255,255,0.03)' }}>
                                        {progressData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                    </RadialBar>
                                    <Legend iconSize={12} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                                    <Tooltip contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontWeight: 900 }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-500 gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"><BookOpen size={24} /></div>
                                <p className="text-sm font-bold uppercase tracking-widest">Enroll to visualize metrics</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl p-8 transition-colors duration-300">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                            <Award size={14} className="text-emerald-600 dark:text-emerald-400" /> Assessment Proficiency
                        </h3>
                        {quizBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={quizBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase' }} />
                                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 900 }} />
                                    <Bar dataKey="score" name="Score %" radius={[6, 6, 0, 0]} barSize={40}>
                                        {quizBarData.map((_, i) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-500 gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"><TrendingUp size={24} /></div>
                                <p className="text-sm font-bold uppercase tracking-widest">No evaluation history</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };



    const renderCourses = () => (
        <div className="space-y-10 animate-fade-in-up">
            <div className="pt-4 pb-2 border-b border-indigo-500/10 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black uppercase tracking-[0.25em] text-indigo-500/80 mb-1 flex items-center gap-4">
                            <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-transparent rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            {t('continuing')}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-16">Resume your academic journey</p>
                    </div>
                    <div className="flex gap-2">
                        {['All', 'BSc', 'BCA', 'BE'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-500 hover:text-white border border-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                {enrollments.length === 0 ? (
                    <div className="bg-white dark:bg-surface-850 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5 p-16 text-center transition-colors duration-300">
                        <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto">Your curriculum is currently empty. Explore available courses to begin your journey.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrollments.filter(e => selectedCategory === 'All' || e.subjectId.category === selectedCategory).map((enrollment, index) => {
                            const colors = [
                                { border: 'border-red-400/20', bg: 'bg-red-400', accent: 'text-red-400' },
                                { border: 'border-emerald-400/20', bg: 'bg-emerald-400', accent: 'text-emerald-400' },
                                { border: 'border-indigo-500/20', bg: 'bg-indigo-500', accent: 'text-indigo-400' },
                            ];
                            const theme = colors[index % colors.length];

                            return (
                                <div key={enrollment._id} className={`group relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-surface-850 border ${theme.border} h-[440px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-black/50 hover:-translate-y-2`}>
                                    <div className="h-52 w-full relative overflow-hidden">
                                        <img
                                            src={getThumbnail(enrollment.subjectId.thumbnail)}
                                            alt={enrollment.subjectId.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-850 via-transparent to-transparent"></div>
                                    </div>

                                    <div className="p-8 pt-2 flex flex-col flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-black text-xl text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{enrollment.subjectId.title}</h3>
                                            {enrollment.subjectId.category && (
                                                <span className="shrink-0 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-2">
                                                    {enrollment.subjectId.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto space-y-5">
                                            <div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Level</span>
                                                    <span className={`text-xs font-black ${theme.accent}`}>{enrollment.percentageCompleted}%</span>
                                                </div>
                                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden backdrop-blur-sm border border-white/5">
                                                    <div
                                                        className={`${theme.bg} h-full rounded-full transition-all duration-1000 ease-out`}
                                                        style={{ width: `${enrollment.percentageCompleted}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/reader/${enrollment.subjectId._id}`)}
                                                className="w-full bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all duration-300 border border-slate-200 dark:border-white/10 hover:border-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-600/20 flex justify-center items-center gap-2"
                                            >
                                                {t('resume')} <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {availableSubjects.length > 0 && (
                <div className="pt-20 border-t border-slate-200 dark:border-white/5 pb-20">
                    <div className="flex flex-col mb-10">
                        <h2 className="text-sm font-black uppercase tracking-[0.25em] text-emerald-500/80 mb-1 flex items-center gap-4">
                            <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            {t('global_catalog')}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-16">Discover new subjects to master</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {availableSubjects.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map(subject => (
                            <div key={subject._id} className="group relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-surface-900 border border-slate-100 dark:border-white/5 h-[400px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-black/50 hover:-translate-y-2">
                                <div className="h-56 w-full relative overflow-hidden">
                                    <img
                                        src={getThumbnail(subject.thumbnail)}
                                        alt={subject.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent"></div>
                                </div>

                                <div className="p-8 pt-0 flex flex-col flex-1 relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-black text-xl text-slate-900 dark:text-white line-clamp-1 leading-snug">{subject.title}</h3>
                                        {subject.category && (
                                            <span className="shrink-0 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-2">
                                                {subject.category}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mb-6 line-clamp-2 leading-relaxed">{subject.description}</p>
                                    <button
                                        onClick={() => handleEnroll(subject._id)}
                                        className="mt-auto w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/20"
                                    >
                                        {t('enroll')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderTests = () => (
        <div className="space-y-10 animate-fade-in-up">
            <div className="relative h-56 rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-300">
                <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80" alt="Assessments" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-surface-950/90 dark:via-surface-950/40 dark:to-transparent flex items-center px-10 lg:px-16 transition-colors duration-300">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">Validation Center</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Performance Assessments</h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold mt-2">Validate your expertise across {enrollments.length} enrolled subjects.</p>
                    </div>
                </div>
            </div>

            {enrollments.length === 0 ? (
                <div className="bg-surface-850 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-white/5">
                    <Award size={60} className="mx-auto text-slate-700 mb-6" />
                    <p className="text-slate-400 font-bold text-lg">Active enrollments required to unlock assessments.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrollments.map((enrollment, index) => {
                        const accents = ['from-red-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-indigo-500 to-violet-600'];
                        const quizList = subjectQuizzes[enrollment.subjectId._id] || [];

                        return (
                            <div key={enrollment._id} className="group relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-surface-850 border border-slate-100 dark:border-white/5 h-[400px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-black/30 hover:-translate-y-2 shadow-xl shadow-black/10 dark:shadow-black/30">
                                <div className="h-48 relative">
                                    <img 
                                        src={getThumbnail(enrollment.subjectId.thumbnail)} 
                                        alt={enrollment.subjectId.title} 
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-900 via-white/20 dark:via-surface-900/40 to-transparent transition-colors duration-300"></div>
                                </div>

                                <div className="p-8 pt-4 flex flex-col flex-1 relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 backdrop-blur-md text-[10px] text-slate-500 dark:text-slate-400 font-black rounded-full border border-slate-200 dark:border-white/10 uppercase tracking-widest">
                                            {quizList.length} Active Assessment{quizList.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase line-clamp-1">{enrollment.subjectId.title}</h3>

                                    {quizList.length > 0 ? (
                                        <div className="space-y-3 mt-auto">
                                            {quizList.map((quiz, qIdx) => (
                                                <button
                                                    key={quiz._id}
                                                    onClick={() => navigate(`/quiz/${enrollment.subjectId._id}`)}
                                                    className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${accents[index % accents.length]} text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-black/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2`}
                                                >
                                                    🎯 Start Evaluation {qIdx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-auto p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-loose">Assessment pipeline pending deployment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderProgress = () => {
        if (enrollments.length === 0) return (
            <div className="space-y-8 animate-fade-in-up flex flex-col items-center justify-center py-24 bg-white dark:bg-surface-850 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl transition-colors duration-300">
                <div className="w-32 h-32 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-8">
                    <TrendingUp size={60} className="text-slate-300 dark:text-slate-700" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Advanced Analytics</h2>
                <p className="text-slate-500 font-bold text-center max-w-sm px-6">Complete curriculum components and validation assessments to unlock global efficiency data.</p>
            </div>
        );

        return (
            <div className="space-y-10 animate-fade-in-up">
                <div className="relative h-56 rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-300">
                    <img src="https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&q=80" alt="Analytics" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-surface-950/90 dark:via-surface-950/40 dark:to-transparent flex items-center px-10 lg:px-16 transition-colors duration-300">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Global Mastery Engine</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Your Analytics</h1>
                            <p className="text-slate-600 dark:text-slate-400 font-bold mt-2">Deep-dive performance breakdown across your learning path.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrollments.map((enrollment, i) => {
                        const subjectQuizIds = subjectQuizzes[enrollment.subjectId._id]?.map(q => q._id) || [];
                        const userSubjectResults = results.filter(r => subjectQuizIds.includes(r.quizId._id) || subjectQuizIds.includes(r.quizId));
                        const averageQuizScore = userSubjectResults.length > 0
                            ? userSubjectResults.reduce((acc, curr) => acc + curr.percentage, 0) / userSubjectResults.length
                            : 0;
                        const completion = enrollment.percentageCompleted || 0;
                        const rankingScore = (averageQuizScore * 0.7) + (completion * 0.3);
                        const gradients = ['from-indigo-500 to-indigo-700', 'from-emerald-500 to-emerald-700', 'from-amber-500 to-orange-700'];

                        return (
                            <div key={enrollment._id} className={`bg-gradient-to-br ${gradients[i % gradients.length]} rounded-[2.5rem] p-10 text-white shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/10 group shadow-lg shadow-black/20`}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white/30"></span> {enrollment.subjectId.title}
                                </p>

                                <div className="space-y-8 mb-10">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-black uppercase tracking-widest text-white/60">Quiz Metrics (70%)</span>
                                            <span className="text-lg font-black text-white">{averageQuizScore.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-black/20 rounded-full h-3 border border-white/10 overflow-hidden backdrop-blur-sm">
                                            <div className="bg-white h-full rounded-full transition-all duration-1500 ease-out shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ width: `${averageQuizScore}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-black uppercase tracking-widest text-white/60">Curriculum (30%)</span>
                                            <span className="text-lg font-black text-white">{completion.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-black/20 rounded-full h-3 border border-white/10 overflow-hidden backdrop-blur-sm">
                                            <div className="bg-white h-full rounded-full transition-all duration-1500 ease-out shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ width: `${completion}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Final Efficiency Index</span>
                                        <span className="text-4xl font-black text-white tracking-tighter">{rankingScore.toFixed(1)}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                                        <TrendingUp size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (currentView === 'dashboard') return renderDashboard();
    if (currentView === 'courses') return renderCourses();
    if (currentView === 'tests') return renderTests();
    if (currentView === 'progress') return renderProgress();
    if (currentView === 'profile') return <ProfileSection />;

    return renderCourses();
};

export default StudentDash;
