import { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertTriangle, CheckCircle, Clock, Eye, Shield, GraduationCap, BookOpen } from 'lucide-react';

const ITAdminDash = ({ currentView = 'glitches' }) => {
    const [glitches, setGlitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [impersonating, setImpersonating] = useState(false);

    useEffect(() => {
        fetchGlitches();
    }, []);

    const fetchGlitches = async () => {
        try {
            const { data } = await api.get('/glitches');
            setGlitches(data);
        } catch (error) {
            console.error('Failed to fetch glitches:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/glitches/${id}/status`, { status });
            setGlitches(glitches.map(g => g._id === id || g.id === id ? { ...g, status } : g));
        } catch (error) {
            console.error('Failed to update glitch status', error);
            alert('Failed to update status');
        }
    };

    const deleteGlitch = async (id) => {
        if (!window.confirm("Are you sure you want to delete this glitch report?")) return;
        try {
            await api.delete(`/glitches/${id}`);
            setGlitches(glitches.filter(g => g._id !== id && g.id !== id));
        } catch (error) {
            console.error('Failed to delete glitch', error);
            alert('Failed to delete report');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const pendingCount = glitches.filter(g => g.status === 'PENDING').length;
    const inProgressCount = glitches.filter(g => g.status === 'IN_PROGRESS').length;
    const resolvedCount = glitches.filter(g => g.status === 'RESOLVED').length;

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Hero Banner */}
            <div className="relative rounded-[2.5rem] overflow-hidden h-40 lg:h-56 group shadow-2xl transition-colors duration-300 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="absolute inset-0 flex items-center px-8 lg:px-16">
                    <div className="max-w-2xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Monitoring Active</span>
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black text-white mt-1 leading-tight uppercase tracking-tighter">
                            IT Operations <br />
                            <span className="text-emerald-400">Command Center</span>
                        </h1>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Issues', value: pendingCount, gradient: 'from-rose-500 to-rose-700', icon: <AlertTriangle size={24} className="text-white" /> },
                    { label: 'In Progress', value: inProgressCount, gradient: 'from-amber-400 to-amber-600', icon: <Clock size={24} className="text-white" /> },
                    { label: 'Resolved Tickets', value: resolvedCount, gradient: 'from-emerald-500 to-emerald-700', icon: <CheckCircle size={24} className="text-white" /> },
                ].map((s, i) => (
                    <div key={i} className={`relative bg-gradient-to-br ${s.gradient} p-8 rounded-[2.5rem] shadow-2xl text-white overflow-hidden hover:-translate-y-2 transition-all duration-300 border border-white/10 group`}>
                        <div className="mb-4 group-hover:scale-125 transition-transform origin-left">{s.icon}</div>
                        <p className="text-4xl lg:text-5xl font-black tracking-tighter mb-1">{s.value}</p>
                        <p className="text-[10px] text-white/70 font-black uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-surface-850 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Glitch Reports</h2>
                    <span className="px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 uppercase tracking-widest">
                        {glitches.length} Total Logs
                    </span>
                </div>
                
                {glitches.length === 0 ? (
                    <div className="p-16 text-center">
                        <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
                        <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">All Systems Operational</h3>
                        <p className="text-sm text-slate-500 mt-2">No technical glitches have been reported.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
                            <thead className="bg-slate-50 dark:bg-white/5">
                                <tr>
                                    {['Reporter', 'Issue Title', 'Description', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-transparent divide-y divide-slate-50 dark:divide-white/5">
                                {glitches.map((g) => (
                                    <tr key={g._id || g.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300">
                                                    {g.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{g.user?.name || 'Unknown'}</span>
                                                    <span className="text-[9px] font-bold text-slate-400">{g.user?.role || 'User'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{g.title}</span>
                                            <div className="text-[10px] text-slate-400 mt-1">{new Date(g.createdAt).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-5 max-w-xs">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={g.description}>
                                                {g.description}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <select
                                                value={g.status}
                                                onChange={(e) => updateStatus(g._id || g.id, e.target.value)}
                                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border-2 outline-none cursor-pointer transition-all ${
                                                    g.status === 'RESOLVED' 
                                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                                        : g.status === 'IN_PROGRESS'
                                                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                }`}
                                            >
                                                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="PENDING">Pending</option>
                                                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="IN_PROGRESS">In Progress</option>
                                                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="RESOLVED">Resolved</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <button 
                                                onClick={() => deleteGlitch(g._id || g.id)}
                                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                Delete
                                            </button>
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
};

export default ITAdminDash;
