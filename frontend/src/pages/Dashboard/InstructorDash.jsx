import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getThumbnail } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Trophy, X, BookOpen, Users, FileQuestion } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ProfileSection from './ProfileSection';

const SUBJECT_IMAGES = [
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80', // code / DSA
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80', // math board
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80', // books / history
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80', // circuit board
];

const ACCENTS = [
    { bar: 'border-red-400', bg: 'bg-red-500', color: '#ef4444' },
    { bar: 'border-emerald-400', bg: 'bg-emerald-500', color: '#10b981' },
    { bar: 'border-indigo-500', bg: 'bg-indigo-500', color: '#6366f1' },
    { bar: 'border-amber-400', bg: 'bg-amber-500', color: '#f59e0b' },
];


const InstructorDash = ({ currentView = 'dashboard' }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [quizzesBySubject, setQuizzesBySubject] = useState({});
    const [rankingsBySubject, setRankingsBySubject] = useState({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const { data: subs } = await api.get('/subjects');
            // Show all subjects to allow cross-instructor collaboration
            const mySubs = subs;

            setSubjects(mySubs);

            // Fetch quizzes and rankings for each subject in parallel
            const qMap = {}, rMap = {};
            await Promise.all(mySubs.map(async (s) => {
                try {
                    const [qRes, rRes] = await Promise.all([
                        api.get(`/quizzes/subject/${s._id}`),
                        api.get(`/analytics/subject/${s._id}/rankings`)
                    ]);
                    qMap[s._id] = qRes.data;
                    rMap[s._id] = rRes.data;
                } catch { qMap[s._id] = []; rMap[s._id] = []; }
            }));
            setQuizzesBySubject(qMap);
            setRankingsBySubject(rMap);
        } catch (error) {
            console.error('Error fetching instructor data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async (quizId, subjectId) => {
        if (!confirm('Delete this quiz? This cannot be undone.')) return;
        try {
            await api.delete(`/quizzes/${quizId}`);
            setQuizzesBySubject(prev => ({
                ...prev,
                [subjectId]: (prev[subjectId] || []).filter(q => (q._id || q.id) !== quizId)
            }));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete quiz.');
        }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subjects', { title: newTitle, description: newDescription, units: [] });
            setNewTitle(''); setNewDescription(''); setShowCreateModal(false);
            fetchAll();
        } catch (error) { console.error('Error creating subject', error); }
    };

    const deleteSubject = async (id) => {
        if (window.confirm('Delete this subject permanently?')) {
            try { await api.delete(`/subjects/${id}`); fetchAll(); }
            catch (error) { console.error('Error deleting subject', error); }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Syncing Scholar Suite...</p>
        </div>
    );

    // ─── CREATE MODAL ────────────────────────────────────────────────────────────
    const createModalContent = (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100 dark:border-white/10 transition-colors duration-300">
                <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Create New Subject</h3>
                    <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateSubject} className="p-10 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Subject Title</label>
                        <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-black placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                            placeholder="e.g. Quantum Mechanics II" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Description</label>
                        <textarea rows="3" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all resize-none"
                            placeholder="Brief course overview..." />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowCreateModal(false)}
                            className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5">Cancel</button>
                        <button type="submit"
                            className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all active:scale-95">
                            Publish Subject →
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // ─── VIEW: DASHBOARD (OVERVIEW) ──────────────────────────────────────────────
    if (currentView === 'dashboard') {
        const totalStudents = Object.values(rankingsBySubject).reduce((a, r) => a + r.length, 0);
        const totalQuizzes = Object.values(quizzesBySubject).reduce((a, q) => a + q.length, 0);

        const barData = subjects.map((s) => ({
            name: s.title.split(' ')[0],
            students: rankingsBySubject[s._id]?.length || 0,
            quizzes: quizzesBySubject[s._id]?.length || 0,
        }));

        return (
            <div className="space-y-10 animate-fade-in-up">
                {/* Hero */}
                <div className="relative h-56 lg:h-64 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-indigo-500/10 transition-colors duration-300">
                    <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&q=80" alt="Instructor Hero" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 dark:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-surface-950/90 dark:via-surface-950/40 dark:to-transparent flex items-center px-8 lg:px-16 transition-colors duration-300">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Instructor ID: {user?.userId || 'INS-001'}</span>
                            </div>
                            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-3">Welcome back, Professor! 👋</h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-lg font-bold">You have {subjects.length} active programs under your command.</p>
                        </div>
                    </div>
                    <button onClick={() => setShowCreateModal(true)}
                        className="absolute top-6 right-8 flex items-center gap-3 bg-white dark:bg-white text-indigo-950 font-black text-xs lg:text-sm px-6 lg:px-8 py-3 lg:py-4 rounded-2xl shadow-2xl hover:bg-indigo-50 transition-all hover:-translate-y-1 active:scale-95 border border-slate-100 dark:border-transparent">
                        <Plus size={20} /> Launch New Subject
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {[
                        { label: 'My Subjects', value: subjects.length, gradient: 'from-indigo-500 to-indigo-700', emoji: '📚', border: 'border-slate-100 dark:border-indigo-500/20' },
                        { label: 'Student Roster', value: totalStudents, gradient: 'from-emerald-500 to-emerald-700', emoji: '🎓', border: 'border-slate-100 dark:border-emerald-500/20' },
                        { label: 'Question Bank', value: totalQuizzes, gradient: 'from-amber-500 to-orange-600', emoji: '🧠', border: 'border-slate-100 dark:border-amber-500/20' },
                    ].map((s, i) => (
                        <div key={i} className={`bg-white dark:bg-surface-850 p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-surface-800 transition-all duration-500 shadow-xl relative overflow-hidden group transition-colors duration-300`}>
                            <div className="flex flex-col relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 dark:bg-white/5 flex items-center justify-center text-2xl mb-6 shadow-inner border border-indigo-500/10 dark:border-white/5 group-hover:scale-110 transition-transform duration-500">{s.emoji}</div>
                                <p className="text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{s.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{s.label}</p>
                            </div>
                            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 dark:opacity-5 blur-2xl group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity`}></div>
                        </div>
                    ))}
                </div>

                {/* Analytical Visualization */}
                {barData.length > 0 && (
                    <div className="bg-white dark:bg-surface-850 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl p-10 transition-colors duration-300">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-10 flex items-center gap-2">
                            <Trophy size={14} className="text-indigo-600 dark:text-indigo-400" /> Program Efficiency Matrix
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontWeight: 900 }} />
                                <Bar dataKey="students" name="Students" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
                                <Bar dataKey="quizzes" name="Quizzes" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {showCreateModal && createModalContent}
            </div>
        );
    }

    // ─── VIEW: MY COURSES ────────────────────────────────────────────────────────
    if (currentView === 'courses') {
        return (
            <div className="space-y-10 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-indigo-500/30"></span> Curriculum Command
                        </h2>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">My Instructional Suite</h1>
                    </div>
                    <button onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 active:scale-95">
                        <Plus size={20} /> Create New Subject
                    </button>
                </div>

                {subjects.length === 0 ? (
                    <div className="bg-surface-850 rounded-[3rem] p-24 text-center border-2 border-dashed border-white/5">
                        <BookOpen size={64} className="mx-auto text-slate-800 mb-6" />
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Your Curriculum is Empty</h3>
                        <p className="text-slate-500 font-bold max-w-sm mx-auto">Click "Create New Subject" to architect your first professional learning path.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subjects.map((subject, index) => {
                            const theme = ACCENTS[index % ACCENTS.length];
                            return (
                                <div key={subject._id} className="group relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-surface-850 border border-slate-100 dark:border-white/5 h-[440px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-black/60 hover:-translate-y-2">
                                    <div className="h-52 w-full relative overflow-hidden">
                                        <img src={getThumbnail(subject.thumbnail) || SUBJECT_IMAGES[index % SUBJECT_IMAGES.length]} alt={subject.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-850 via-transparent to-transparent"></div>
                                        
                                        {/* Dynamic badges */}
                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <span className="px-3 py-1 bg-white/80 dark:bg-black/60 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black rounded-full border border-slate-200 dark:border-white/10 uppercase tracking-widest">
                                                {subject.units?.length || 0} Units
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 pt-2 flex flex-col flex-1 relative z-10">
                                        <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{subject.title}</h3>
                                        <p className="text-xs font-bold text-slate-500 line-clamp-2 leading-relaxed mb-6">{subject.description}</p>
                                        
                                        <div className="mt-auto flex items-center gap-3">
                                            <button onClick={() => navigate(`/instructor/subject/${subject._id}`)}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                                                <Edit2 size={14} /> Engineer Content
                                            </button>
                                            <button onClick={() => deleteSubject(subject._id)}
                                                className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-red-600 text-slate-400 dark:text-slate-500 hover:text-white border border-slate-200 dark:border-white/5 rounded-xl transition-all duration-300">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {showCreateModal && createModalContent}
            </div>
        );
    }

    // ─── VIEW: ASSESSMENTS ───────────────────────────────────────────────────────
    if (currentView === 'tests') {
        return (
            <div className="space-y-10 animate-fade-in-up">
                <div className="relative h-60 rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-300">
                    <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80" alt="Assessments" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 group-hover:opacity-100 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-surface-950/90 dark:via-surface-950/40 dark:to-transparent flex items-center px-10 lg:px-16 transition-colors duration-300">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">Question Repository</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Evaluation Systems</h1>
                            <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 max-w-xl leading-relaxed">Systematically review and deploy assessment markers across your active learning paths.</p>
                        </div>
                    </div>
                </div>

                {subjects.length === 0 ? (
                    <div className="bg-surface-850 rounded-[3rem] p-24 text-center border-2 border-dashed border-white/5">
                        <FileQuestion size={64} className="mx-auto text-slate-800 mb-6" />
                        <p className="text-slate-500 font-bold">Launch a subject first to initialize the assessment pipeline.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {subjects.map((subject, i) => {
                            const quizzes = quizzesBySubject[subject._id] || [];
                            return (
                                <div key={subject._id} className="bg-white dark:bg-surface-850 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden group hover:bg-slate-50 dark:hover:bg-surface-800 transition-all duration-500">
                                    <div className="relative h-36">
                                        <img src={getThumbnail(subject.thumbnail) || SUBJECT_IMAGES[i % SUBJECT_IMAGES.length]} alt={subject.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-850 to-transparent flex items-end p-8">
                                            <div>
                                                <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase">{subject.title}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black border border-indigo-500/20">{quizzes.length}</div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Quizzes</span>
                                            </div>
                                            <button onClick={() => navigate(`/instructor/subject/${subject._id}?tab=quizzes`)}
                                                className="text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 text-slate-600 dark:text-slate-300 hover:text-white border border-slate-200 dark:border-white/5 hover:border-indigo-500 transition-all">
                                                + Deploy Quiz
                                            </button>
                                        </div>

                                        {quizzes.length === 0 ? (
                                            <div className="py-12 text-center text-slate-600 text-xs font-black uppercase tracking-widest border border-dashed border-white/5 rounded-[2rem] bg-black/5">
                                                <FileQuestion size={32} className="mx-auto mb-4 opacity-20" />
                                                Pipeline Inactive
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {quizzes.map((quiz, qIdx) => (
                                                    <div key={quiz._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group/item hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-xs font-black text-slate-400 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors uppercase border border-slate-100 dark:border-transparent">{qIdx + 1}</div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{quiz.title}</p>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">{quiz.questions?.length || 0} Parameters • Verified MCQ</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => navigate(`/instructor/subject/${subject._id}?tab=quizzes&edit=${quiz._id}`)}
                                                                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 hover:bg-indigo-600 text-slate-400 dark:text-slate-500 hover:text-white rounded-xl transition-all border border-slate-200 dark:border-transparent" title="Edit Quiz">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => handleDeleteQuiz(quiz._id, subject._id)}
                                                                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 hover:bg-red-600 text-slate-400 dark:text-slate-500 hover:text-white rounded-xl transition-all border border-slate-200 dark:border-transparent" title="Delete Quiz">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
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
    }

    // ─── VIEW: PROFILE ──────────────────────────────────────────────────────────
    if (currentView === 'profile') {
        return <ProfileSection />;
    }

    // ─── VIEW: ANALYTICS ─────────────────────────────────────────────────────────
    return (
        <div className="space-y-10 animate-fade-in-up">
            <div className="relative h-60 rounded-[3rem] overflow-hidden shadow-2xl transition-colors duration-300">
                <img src="https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&q=80" alt="Analytics" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 dark:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-surface-950/90 dark:via-surface-950/40 dark:to-transparent flex items-center px-10 lg:px-16 transition-colors duration-300">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Live Insight Matrix</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Student Proficiency</h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 max-w-xl leading-relaxed">Real-time performance tracking across all synchronized subject modules.</p>
                    </div>
                </div>
            </div>

            {subjects.map((subject, i) => {
                const rankings = rankingsBySubject[subject._id] || [];
                return (
                    <div key={subject._id} className="bg-white dark:bg-surface-850 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:bg-slate-50 dark:hover:bg-surface-800">
                        <div className="relative h-28">
                            <img src={getThumbnail(subject.thumbnail) || SUBJECT_IMAGES[i % SUBJECT_IMAGES.length]} alt={subject.title} className="w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-surface-850 via-white/80 dark:via-surface-850/60 to-transparent flex items-center px-10 transition-colors duration-300">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{rankings.length} Active Candidates</span>
                                    </div>
                                    <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight uppercase">{subject.title}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="p-10">
                            {rankings.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-black/5 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/5">
                                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-sm font-black uppercase tracking-widest">Awaiting Initial Enrollments</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden bg-white dark:bg-black/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                                    <table className="min-w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-white/5">
                                                {['Rank', 'Candidate', 'Evaluation', 'Progress', 'Index'].map(h => (
                                                    <th key={h} className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                            {rankings.map((r, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : idx === 1 ? 'bg-slate-500/20 text-slate-400 border border-slate-500/20' : idx === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-white/5 text-slate-600 border border-white/5'} transition-all`}>
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                                                {r.name?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{r.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-600">{r.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-indigo-400">{r.averageQuizScore}%</span>
                                                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="bg-indigo-500 h-full" style={{ width: `${r.averageQuizScore}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-emerald-400">{r.completionPercentage}%</span>
                                                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="bg-emerald-500 h-full" style={{ width: `${r.completionPercentage}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="font-black text-xl text-slate-900 dark:text-white tracking-tighter shadow-indigo-500/20">{r.finalRankingScore}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InstructorDash;
