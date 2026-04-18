import { useState } from 'react';
import api from '../services/api';
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle, BookOpen } from 'lucide-react';

/**
 * PdfQAPanel
 * Renders a "Generate Q&A" button below a PDF embed.
 * Calls /api/upload/analyze-pdf and displays Q&A pairs restricted to syllabus topics.
 *
 * Props:
 *   pdfUrl         – server path, e.g. "/uploads/document-12345.pdf"
 *   syllabusTopics – array of topic strings from subject syllabus
 *   subjectTitle   – subject name for display
 */
const PdfQAPanel = ({ pdfUrl, syllabusTopics = [], subjectTitle = '' }) => {
    const [loading, setLoading]   = useState(false);
    const [qaList,  setQaList]    = useState([]);
    const [error,   setError]     = useState(null);
    const [open,    setOpen]      = useState(null);

    const handleGenerate = async () => {
        if (qaList.length > 0) {
            setQaList([]);
            setOpen(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/upload/analyze-pdf', {
                pdfUrl,
                numQuestions: 8,
                syllabusTopics,
                subjectTitle,
            });
            setQaList(res.data.qaList || []);
            setOpen(0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate Q&A. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 mb-8 animate-fade-in-up">
            {/* Topic chips — show what topics AI will focus on */}
            {syllabusTopics.length > 0 && qaList.length === 0 && !loading && (
                <div className="mb-3 flex flex-wrap gap-2">
                    <span className="text-xs text-slate-500 self-center font-semibold">Focus topics:</span>
                    {syllabusTopics.slice(0, 6).map((t, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                            {t}
                        </span>
                    ))}
                    {syllabusTopics.length > 6 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-500">
                            +{syllabusTopics.length - 6} more
                        </span>
                    )}
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`
                    group flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm
                    transition-all duration-300
                    ${qaList.length > 0
                        ? 'bg-violet-500/10 text-violet-300 border border-violet-500/30 hover:bg-violet-500/20'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-105'}
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
            >
                {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Sparkles size={16} className={qaList.length > 0 ? '' : 'group-hover:animate-pulse'} />
                }
                {loading
                    ? 'Analyzing PDF…'
                    : qaList.length > 0
                        ? 'Hide Q&A'
                        : '✨ Generate Q&A from PDF'
                }
            </button>

            {/* Error */}
            {error && (
                <div className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-5 py-4 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Q&A List */}
            {qaList.length > 0 && (
                <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen size={16} className="text-violet-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-violet-400">
                            AI-Generated Q&amp;A — Syllabus Topics Only ({qaList.length} questions)
                        </span>
                    </div>

                    {qaList.map((qa, idx) => (
                        <div
                            key={idx}
                            className={`
                                rounded-2xl border transition-all duration-300 overflow-hidden
                                ${open === idx
                                    ? 'border-violet-500/40 bg-violet-500/10'
                                    : 'border-white/8 bg-white/3 hover:border-white/15'}
                            `}
                        >
                            <button
                                onClick={() => setOpen(open === idx ? null : idx)}
                                className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left group"
                            >
                                <span className="flex items-start gap-3">
                                    <span className={`
                                        mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black
                                        ${open === idx ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-400'}
                                    `}>
                                        {idx + 1}
                                    </span>
                                    <span className={`font-semibold text-sm leading-snug ${open === idx ? 'text-white' : 'text-slate-300'}`}>
                                        {qa.question}
                                    </span>
                                </span>
                                {open === idx
                                    ? <ChevronUp size={16} className="shrink-0 text-violet-400 mt-1" />
                                    : <ChevronDown size={16} className="shrink-0 text-slate-500 mt-1" />
                                }
                            </button>

                            {open === idx && (
                                <div className="px-5 pb-5 pt-0">
                                    <div className="ml-9 text-sm text-slate-300 leading-relaxed bg-violet-950/30 rounded-xl px-4 py-3 border border-violet-500/20">
                                        {qa.answer}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PdfQAPanel;
