import { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertCircle, X, ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const ReportGlitchModal = ({ isOpen, onClose }) => {
    const [tab, setTab] = useState('report');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && tab === 'tickets') {
            fetchMyTickets();
        }
    }, [isOpen, tab]);

    const fetchMyTickets = async () => {
        setTicketsLoading(true);
        try {
            const { data } = await api.get('/glitches');
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setTicketsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/glitches', { title, description });
            alert('Glitch reported successfully! IT Admin will look into it.');
            setTitle('');
            setDescription('');
            setTab('tickets');
            fetchMyTickets();
        } catch (error) {
            console.error('Failed to report glitch', error);
            alert('Failed to report glitch.');
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        PENDING: { label: 'Pending', icon: <AlertTriangle size={14} />, bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
        IN_PROGRESS: { label: 'In Progress', icon: <Clock size={14} />, bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
        RESOLVED: { label: 'Resolved', icon: <CheckCircle size={14} />, bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white dark:bg-surface-850 rounded-3xl shadow-2xl w-full max-w-lg p-8 relative z-10 animate-fade-in-up border border-slate-100 dark:border-white/5">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>
                
                {/* Tab Headers */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('report')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                            tab === 'report'
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <AlertCircle size={16} />
                        Report
                    </button>
                    <button
                        onClick={() => setTab('tickets')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                            tab === 'tickets'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <ClipboardList size={16} />
                        My Reports
                    </button>
                </div>

                {/* Tab: Report a Glitch */}
                {tab === 'report' && (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Report a Tech Glitch</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IT Admin Support System</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2 pl-1">Issue Title</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Cannot open Quiz 3"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2 pl-1">Detailed Description</label>
                                <textarea 
                                    required
                                    placeholder="Please describe what happened, steps to reproduce, etc."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400 resize-none custom-scrollbar"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !title.trim() || !description.trim()}
                                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </>
                )}

                {/* Tab: My Reports */}
                {tab === 'tickets' && (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                                <ClipboardList size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">My Reports</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Track your submitted issues</p>
                            </div>
                        </div>

                        {ticketsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle size={40} className="mx-auto text-emerald-500/50 mb-3" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Reports Yet</p>
                                <p className="text-xs text-slate-400 mt-1">Your submitted glitch reports will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                {tickets.map((ticket) => {
                                    const config = statusConfig[ticket.status] || statusConfig.PENDING;
                                    return (
                                        <div
                                            key={ticket.id || ticket._id}
                                            className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{ticket.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ticket.description}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2">
                                                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text} border ${config.border} whitespace-nowrap flex-shrink-0`}>
                                                    {config.icon}
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportGlitchModal;
