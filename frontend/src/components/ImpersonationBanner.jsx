import { Eye, LogOut } from 'lucide-react';

const ImpersonationBanner = ({ viewingAs, onExit }) => {
    const roleColors = {
        ADMIN: 'from-violet-600 to-purple-700',
        INSTRUCTOR: 'from-blue-600 to-indigo-700',
        STUDENT: 'from-emerald-600 to-teal-700',
    };
    const gradient = roleColors[viewingAs] || 'from-slate-600 to-slate-700';

    return (
        <div className={`fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r ${gradient} text-white flex items-center justify-between px-6 py-2.5 shadow-xl`}>
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Eye size={13} className="text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">
                    IT Admin — Viewing as <span className="text-white/90">{viewingAs}</span>
                </span>
            </div>
            <button
                onClick={onExit}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-black uppercase tracking-widest transition-all border border-white/30"
            >
                <LogOut size={13} />
                Exit
            </button>
        </div>
    );
};

export default ImpersonationBanner;
