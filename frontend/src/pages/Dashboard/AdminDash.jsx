import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import ProfileSection from './ProfileSection';
import ITAdminDash from './ITAdminDash';

const PINTEREST_IMAGES = [
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDash = ({ currentView = 'overview' }) => {
    const [users, setUsers] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignModal, setAssignModal] = useState({ open: false, instructor: null });
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [usersRes, ranksRes, actRes, subjectsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/analytics/college-rankings'),
                api.get('/admin/activity'),
                api.get('/subjects')
            ]);
            setUsers(usersRes.data);
            setRankings(ranksRes.data);
            setActivities(actRes.data);
            setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            const { data } = await api.put(`/admin/users/${id}/status`);
            setUsers(users.map(u => (u._id === id ? data : u)));
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this user? All their data will be lost.")) {
            try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                console.error('Failed to delete user', error);
                alert(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const updateRole = async (id, newRole) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            fetchData();
        } catch (error) { console.error('Failed to update role', error); }
    };

    const manualVerify = async (id) => {
        try {
            const { data } = await api.put(`/admin/users/${id}/verify`);
            setUsers(users.map(u => (u._id === id ? data : u)));
        } catch (error) {
            console.error('Failed to manually verify user', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    // --- Derived chart data from real API data ---
    const studentCount = users.filter(u => u.role === 'STUDENT').length;
    const instructorCount = users.filter(u => u.role === 'INSTRUCTOR').length;
    const adminCount = users.filter(u => u.role === 'ADMIN' || u.role === 'IT_ADMIN').length;
    const itAdminCount = users.filter(u => u.role === 'IT_ADMIN').length;
    const activeCount = users.filter(u => u.status === 'ACTIVE').length;
    const inactiveCount = users.filter(u => u.status === 'INACTIVE').length;

    const pieData = [
        { name: 'Students', value: studentCount || 1 },
        { name: 'Instructors', value: instructorCount || 1 },
        { name: 'Admins', value: adminCount || 1 },
    ];

    const statusPieData = [
        { name: 'Active', value: activeCount || 1 },
        { name: 'Inactive', value: inactiveCount || 1 },
    ];

    const rankBarData = rankings.slice(0, 8).map(r => ({
        name: r.name?.split(' ')[0] || 'Student',
        score: parseFloat(r.finalRankingScore) || 0,
        quiz: parseFloat(r.averageQuizScore) || 0,
    }));

    const areaData = [
        { month: 'Jan', users: Math.max(1, users.length - 5) },
        { month: 'Feb', users: Math.max(1, users.length - 3) },
        { month: 'Mar', users: Math.max(1, users.length - 1) },
        { month: 'Apr', users: users.length },
    ];

    // --- Assign Subject Modal ---
    const AssignSubjectModal = () => {
        if (!assignModal.open) return null;
        const handleAssign = async () => {
            if (!selectedSubjectId) return;
            setAssignLoading(true);
            try {
                await api.put(`/subjects/${selectedSubjectId}`, {
                    instructor_id: assignModal.instructor._id
                });
                await fetchData();
                setAssignModal({ open: false, instructor: null });
                setSelectedSubjectId('');
            } catch (err) {
                console.error('Failed to assign subject', err);
            } finally {
                setAssignLoading(false);
            }
        };
        return (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-1">Assign Subject</h3>
                    <p className="text-sm text-slate-400 mb-6">
                        Assigning to <span className="font-bold text-indigo-600">{assignModal.instructor?.name}</span>
                    </p>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3 pl-1">Select Subject</label>
                    <select
                        value={selectedSubjectId}
                        onChange={e => setSelectedSubjectId(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none mb-8 transition-all"
                    >
                        <option value="">-- Choose a subject --</option>
                        {subjects.map(s => (
                            <option key={s._id || s.id} value={s._id || s.id}>
                                [{s.category || 'General'}] {s.title || s.subject_name}{s.instructorId ? ' (already assigned)' : ''}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setAssignModal({ open: false, instructor: null }); setSelectedSubjectId(''); }}
                            className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={!selectedSubjectId || assignLoading}
                            className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            {assignLoading ? 'Assigning...' : 'Confirm →'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Shared table ---
    const renderUserTable = (filteredUsers, title) => (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{title}</h2>
                <span className="px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-full border border-indigo-500/20 uppercase tracking-widest">{filteredUsers.length} Users Locked</span>
            </div>
            <div className="bg-white dark:bg-surface-850 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
                        <thead className="bg-slate-50 dark:bg-white/5">
                            <tr>
                                {['Name', 'Email', 'Role', 'Status', 'Action', 'Subject'].map(h => (
                                    <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-transparent divide-y divide-slate-50 dark:divide-white/5">
                            {filteredUsers.map((u) => (
                                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                                {u.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{u.name}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-0.5">{u.userId || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u.role === 'ADMIN' ? (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-3 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">System Admin</span>
                                        ) : u.role === 'IT_ADMIN' ? (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">IT Admin</span>
                                        ) : (
                                            <select
                                                value={u.role}
                                                onChange={(e) => updateRole(u._id, e.target.value)}
                                                className="text-xs font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer transition-all"
                                            >
                                                <option value="STUDENT">Student</option>
                                                <option value="INSTRUCTOR">Instructor</option>
                                                <option value="IT_ADMIN">IT Admin</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u.role === 'ADMIN' ? (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 px-4 py-2 border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-full">Protected</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {!u.isVerified && (
                                                    <button onClick={() => manualVerify(u._id)} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-500/10">
                                                        Verify
                                                    </button>
                                                )}
                                                <button onClick={() => toggleStatus(u._id)} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border ${u.status === 'ACTIVE' ? 'text-red-500 border-red-200 dark:border-red-500/30 hover:bg-red-600 hover:text-white' : 'text-emerald-600 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-600 hover:text-white'}`}>
                                                    {u.status === 'ACTIVE' ? 'Lock' : 'Unseal'}
                                                </button>
                                                <button onClick={() => deleteUser(u._id)} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all">
                                                    Wipe
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u.role === 'INSTRUCTOR' ? (
                                            <button
                                                onClick={() => { setAssignModal({ open: true, instructor: u }); setSelectedSubjectId(''); }}
                                                className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all border border-slate-200 dark:border-white/10">
                                                Assign Registry
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-300 dark:text-slate-700 font-bold uppercase tracking-widest pl-4">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AssignSubjectModal />
        </div>
    );

    if (currentView === 'profile') return <ProfileSection />;
    if (currentView === 'glitches') return <ITAdminDash />;

    // --- Activity Logs Table ---
    if (currentView === 'activity') return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Activity Logs</h2>
            <div className="bg-white dark:bg-surface-850 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
                        <thead className="bg-slate-50 dark:bg-white/5">
                            <tr>
                                {['Student', 'Role', 'Login Time', 'Logout Time', 'Duration'].map(h => (
                                    <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-transparent divide-y divide-slate-50 dark:divide-white/5">
                            {activities.map((act) => (
                                <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                                {act.user ? act.user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className={`text-sm font-black uppercase tracking-tight ${act.user ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600 italic'}`}>
                                                {act.user ? act.user.name : 'Unknown Registry'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        {act.user ? act.user.role : 'GHOST'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-bold">{new Date(act.loginTime).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                                        {act.logoutTime ? <span className="text-slate-600 dark:text-slate-300">{new Date(act.logoutTime).toLocaleString()}</span> : <span className="text-emerald-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-black text-xs uppercase tracking-widest text-indigo-700 dark:text-indigo-400">{act.durationSeconds ? `${Math.floor(act.durationSeconds / 60)}m ${act.durationSeconds % 60}s` : '-'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    if (currentView === 'all-users') return renderUserTable(users, 'All Users');
    if (currentView === 'students') return renderUserTable(users.filter(u => u.role === 'STUDENT'), 'Students');
    if (currentView === 'instructors') return renderUserTable(users.filter(u => u.role === 'INSTRUCTOR'), 'Instructors');

    if (currentView === 'rankings') return (
        <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">🏆 Global Rankings</h2>
            <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 p-8 transition-colors duration-300">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Performance Spectrum
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rankBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontWeight: 900 }} />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '20px' }} />
                        <Bar dataKey="score" name="Registry Score" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="quiz" name="Quiz Mastery" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
                        <thead className="bg-slate-50 dark:bg-white/5">
                            <tr>
                                {['Rank', 'Student', 'Avg Quiz', 'Completion', 'Final Score'].map(h => (
                                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-transparent divide-y divide-slate-50 dark:divide-white/5">
                            {rankings.map((r, i) => (
                                <tr key={i} className={`transition-all ${i === 0 ? 'bg-amber-500/5 dark:bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                    <td className="px-6 py-5">
                                        <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg ${i === 0 ? 'bg-amber-400 text-white shadow-amber-400/20' : i === 1 ? 'bg-slate-300 text-white shadow-slate-400/20' : i === 2 ? 'bg-orange-300 text-white shadow-orange-400/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'}`}>
                                            #{i + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{r.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{r.email}</div>
                                    </td>
                                    <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{r.averageQuizScore}%</td>
                                    <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{r.completionPercentage}%</td>
                                    <td className="px-6 py-5">
                                        <span className="font-black text-xl text-indigo-700 dark:text-indigo-400 tracking-tighter">{r.finalRankingScore}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    if (currentView === 'statistics') return (
        <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Platform Intel</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Registry', value: users.length, color: 'from-violet-600 to-indigo-800', emoji: '👥' },
                    { label: 'Student Core', value: studentCount, color: 'from-emerald-500 to-teal-700', emoji: '🎓' },
                    { label: 'Instructor Staff', value: instructorCount, color: 'from-amber-500 to-orange-700', emoji: '👨‍🏫' },
                    { label: 'Active Signals', value: activeCount, color: 'from-rose-500 to-pink-700', emoji: '✅' },
                ].map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${stat.color} p-8 rounded-[2.5rem] shadow-2xl text-white hover:-translate-y-2 transition-all duration-300 border border-white/10 group`}>
                        <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{stat.emoji}</div>
                        <p className="text-5xl font-black mb-1 tracking-tighter">{stat.value}</p>
                        <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 p-8 transition-colors duration-300">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8 pl-1">Registry Distribution</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} paddingAngle={8} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 900 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 p-8 transition-colors duration-300">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8 pl-1">Operational Pulse</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={100} paddingAngle={8} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                <Cell fill="#10b981" strokeWidth={0} />
                                <Cell fill="#ef4444" strokeWidth={0} />
                            </Pie>
                            <Tooltip contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 900 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    // OVERVIEW (default)
    return (
        <div className="space-y-8 lg:space-y-10 animate-fade-in-up">
            {/* Hero Banner */}
            <div className="relative rounded-[2.5rem] overflow-hidden h-48 lg:h-64 group shadow-2xl transition-colors duration-300">
                <img src={PINTEREST_IMAGES[0]} alt="Hero" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 dark:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent dark:from-surface-950/90 dark:via-surface-950/40 dark:to-transparent flex items-center px-8 lg:px-16 transition-colors duration-300">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Core Command Terminal</span>
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mt-1 leading-tight uppercase tracking-tighter">System Access<br /><span className="text-indigo-600 dark:text-indigo-400">Administrator</span></h1>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Registry', value: users.length, gradient: 'from-violet-600 to-indigo-800', emoji: '👥' },
                    { label: 'Student Core', value: studentCount, gradient: 'from-emerald-500 to-teal-700', emoji: '🎓' },
                    { label: 'Instructor Staff', value: instructorCount, gradient: 'from-amber-500 to-orange-700', emoji: '👨‍🏫' },
                    { label: 'Active Signals', value: activeCount, gradient: 'from-rose-500 to-pink-700', emoji: '✅' },
                ].map((s, i) => (
                    <div key={i} className={`relative bg-gradient-to-br ${s.gradient} p-8 rounded-[2.5rem] shadow-2xl text-white overflow-hidden hover:-translate-y-2 transition-all duration-300 border border-white/10 group`}>
                        <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{s.emoji}</div>
                        <p className="text-4xl lg:text-5xl font-black tracking-tighter mb-1">{s.value}</p>
                        <p className="text-[10px] text-white/70 font-black uppercase tracking-widest mt-1">{s.label}</p>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Area Chart - User Growth */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 p-8 transition-colors duration-300">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8 pl-1 flex items-center gap-2">
                        <TrendingUp size={14} className="text-indigo-600 dark:text-indigo-400" /> Platform Velocity
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900, textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 900 }} />
                            <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} fill="url(#colorUsers)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 8, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart - Roles */}
                <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 p-8 transition-colors duration-300">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8 pl-1">Registry Core</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={8} dataKey="value">
                                {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 900 }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ranking Bar Chart + Top Students */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 p-8 transition-colors duration-300">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8 pl-1">Registry Execution</h3>
                    {rankBarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={rankBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#171923', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 900 }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                                <Bar dataKey="score" name="Registry Score" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="quiz" name="Quiz Depth %" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-60 flex items-center justify-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic opacity-50">Awaiting Assessment Deployment...</div>
                    )}
                </div>

                {/* Top Students Panel with Pinterest Images */}
                <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
                    <div className="relative h-36 overflow-hidden">
                        <img src={PINTEREST_IMAGES[1]} alt="Top Students" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-850 via-white/20 dark:via-surface-850/40 to-transparent"></div>
                        <h3 className="absolute bottom-4 left-6 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Elite Performers</h3>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-white/5">
                        {rankings.slice(0, 4).map((rank, i) => (
                            <li key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-black w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${i === 0 ? 'bg-amber-400 text-white shadow-amber-400/20' : i === 1 ? 'bg-slate-300 text-white shadow-slate-400/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'}`}>#{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{rank.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Mastery: {rank.averageQuizScore}%</p>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 tracking-tighter">{rank.finalRankingScore}</span>
                            </li>
                        ))}
                        {rankings.length === 0 && (
                            <li className="px-8 py-10 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic opacity-50">Registry Sync Pending...</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDash;