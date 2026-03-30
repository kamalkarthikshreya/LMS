import { useState } from 'react';
import api from '../services/api';
import { AlertCircle, X } from 'lucide-react';

const ReportGlitchModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/glitches', { title, description });
            alert('Glitch reported successfully! IT Admin will look into it.');
            setTitle('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error('Failed to report glitch', error);
            alert('Failed to report glitch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white dark:bg-surface-850 rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-fade-in-up border border-slate-100 dark:border-white/5">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>

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
            </div>
        </div>
    );
};

export default ReportGlitchModal;
