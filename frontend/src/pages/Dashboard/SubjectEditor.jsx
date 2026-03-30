import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, Plus, Trash2, Video, FileText, BookOpen, FileQuestion, CheckCircle2, Pencil, X, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SubjectEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'quizzes' ? 'quizzes' : 'curriculum');
    const { t, i18n } = useTranslation();

    // Quiz state
    const [quizzes, setQuizzes] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [numQuestions, setNumQuestions] = useState(3);
    const [numOptions, setNumOptions] = useState(3);
    const [questions, setQuestions] = useState(
        Array.from({ length: 3 }, () => ({
            questionText: '',
            options: ['', '', ''],
            correctOptionIndex: 0
        }))
    );
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [editingQuizId, setEditingQuizId] = useState(null); // null = create mode, id = edit mode
    const [generatingAi, setGeneratingAi] = useState(false);

    const handleNumQuestionsChange = (n) => {
        const val = Math.max(1, Math.min(50, n));
        setNumQuestions(val);
        setQuestions(prev => {
            if (val > prev.length) return [...prev, ...Array.from({ length: val - prev.length }, () => ({ questionText: '', options: Array(numOptions).fill(''), correctOptionIndex: 0 }))];
            return prev.slice(0, val);
        });
    };

    const handleNumOptionsChange = (n) => {
        const val = Math.max(2, Math.min(8, n));
        setNumOptions(val);
        setQuestions(prev => prev.map(q => {
            const opts = val > q.options.length ? [...q.options, ...Array(val - q.options.length).fill('')] : q.options.slice(0, val);
            return { ...q, options: opts, correctOptionIndex: Math.min(q.correctOptionIndex, val - 1) };
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, quizRes] = await Promise.all([
                    api.get(`/subjects/${id}`),
                    api.get(`/quizzes/subject/${id}`)
                ]);
                setSubject({ ...subRes.data, units: subRes.data.units || [] });
                setQuizzes(quizRes.data);

                // Auto-load quiz for editing if ?edit=quizId is present
                const editId = searchParams.get('edit');
                if (editId && quizRes.data.length > 0) {
                    const quizToEdit = quizRes.data.find(q => String(q._id || q.id) === editId);
                    if (quizToEdit) {
                        setEditingQuizId(quizToEdit._id || quizToEdit.id);
                        setQuizTitle(quizToEdit.title);
                        const qs = quizToEdit.questions || [];
                        setNumQuestions(qs.length);
                        setNumOptions(qs[0]?.options?.length || 3);
                        setQuestions(qs.map(q => ({ questionText: q.questionText, options: [...q.options], correctOptionIndex: q.correctOptionIndex || 0 })));
                    }
                }
            } catch (error) {
                console.error('Error fetching subject', error);
                alert('Failed to load subject data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // ─── CURRICULUM HANDLERS ─────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/subjects/${id}`, { units: subject.units });
            alert('Subject curriculum saved successfully!');
            // Refresh RAG chatbot knowledge base via backend proxy
            const userInfo = localStorage.getItem('userInfo');
            const token = userInfo ? JSON.parse(userInfo).token : null;
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/rag-reload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            }).catch(() => {});
        } catch (error) {
            console.error('Error saving subject', error);
            const errMsg = error.response?.data?.message || error.message || 'Unknown network error';
            alert(`Failed to save changes: ${errMsg}`);
        } finally {
            setSaving(false);
        }
    };

    const addUnit = () => {
        setSubject(prev => ({
            ...prev,
            units: [...prev.units, { unitNumber: prev.units.length + 1, title: 'New Unit', chapters: [] }]
        }));
    };

    const addChapter = (unitIndex) => {
        const newUnits = [...subject.units];
        newUnits[unitIndex].chapters.push({ chapterNumber: newUnits[unitIndex].chapters.length + 1, title: 'New Chapter', sections: [] });
        setSubject({ ...subject, units: newUnits });
    };

    const addSection = (unitIndex, chapterIndex) => {
        const newUnits = [...subject.units];
        newUnits[unitIndex].chapters[chapterIndex].sections.push({
            sectionNumber: newUnits[unitIndex].chapters[chapterIndex].sections.length + 1,
            title: 'New Section', videoUrl: '', paragraphs: ['']
        });
        setSubject({ ...subject, units: newUnits });
    };

    const updateSection = (unitIndex, chapterIndex, sectionIndex, field, value) => {
        const newUnits = [...subject.units];
        newUnits[unitIndex].chapters[chapterIndex].sections[sectionIndex][field] = value;
        setSubject({ ...subject, units: newUnits });
    };

    const updateParagraph = (unitIndex, chapterIndex, sectionIndex, paraIndex, value) => {
        const newUnits = [...subject.units];
        newUnits[unitIndex].chapters[chapterIndex].sections[sectionIndex].paragraphs[paraIndex] = value;
        setSubject({ ...subject, units: newUnits });
    };

    const addParagraph = (unitIndex, chapterIndex, sectionIndex) => {
        const newUnits = [...subject.units];
        newUnits[unitIndex].chapters[chapterIndex].sections[sectionIndex].paragraphs.push('');
        setSubject({ ...subject, units: newUnits });
    };

    const removeParagraph = (unitIndex, chapterIndex, sectionIndex, paraIndex) => {
        const newUnits = [...subject.units];
        newUnits[unitIndex].chapters[chapterIndex].sections[sectionIndex].paragraphs.splice(paraIndex, 1);
        setSubject({ ...subject, units: newUnits });
    };

    const uploadPdf = async (unitIndex, chapterIndex, sectionIndex, file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            return alert('Only PDF files are allowed.');
        }

        const formData = new FormData();
        formData.append('document', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newUnits = [...subject.units];
            newUnits[unitIndex].chapters[chapterIndex].sections[sectionIndex].paragraphs.push(`[PDF] ${data.url}`);
            setSubject({ ...subject, units: newUnits });
            // Refresh RAG chatbot knowledge base via backend proxy
            const userInfoPdf = localStorage.getItem('userInfo');
            const tokenPdf = userInfoPdf ? JSON.parse(userInfoPdf).token : null;
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/rag-reload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${tokenPdf}` }
            }).catch(() => {});
        } catch (error) {
            console.error('Error uploading file', error);
            alert('Failed to upload PDF: ' + (error.response?.data?.message || error.message));
        }
    };

    // ─── QUIZ HANDLERS ──────────────────────────
    const updateQuestion = (qIdx, field, value) => {
        setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, [field]: value } : q));
    };

    const updateOption = (qIdx, oIdx, value) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIdx) return q;
            const newOpts = [...q.options];
            newOpts[oIdx] = value;
            return { ...q, options: newOpts };
        }));
    };

    const handleSubmitQuiz = async (e) => {
        e.preventDefault();
        if (!quizTitle.trim()) return alert('Please enter a quiz title.');
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText.trim()) return alert(`Question ${i + 1} is empty.`);
            for (let j = 0; j < questions[i].options.length; j++) {
                if (!questions[i].options[j].trim()) return alert(`Option ${j + 1} of Question ${i + 1} is empty.`);
            }
        }
        setSubmittingQuiz(true);
        try {
            if (editingQuizId) {
                await api.put(`/quizzes/${editingQuizId}`, { title: quizTitle, questions });
                alert('Quiz updated successfully!');
            } else {
                await api.post('/quizzes', { subjectId: id, title: quizTitle, questions });
                alert('Quiz created successfully!');
            }
            resetForm();
            const { data } = await api.get(`/quizzes/subject/${id}`);
            setQuizzes(data);
            // Refresh RAG chatbot knowledge base via backend proxy
            const userInfoQuiz = localStorage.getItem('userInfo');
            const tokenQuiz = userInfoQuiz ? JSON.parse(userInfoQuiz).token : null;
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/rag-reload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${tokenQuiz}` }
            }).catch(() => {});
        } catch (error) {
            console.error('Error saving quiz', error);
            alert(error.response?.data?.message || 'Failed to save quiz.');
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const resetForm = () => {
        setEditingQuizId(null);
        setQuizTitle('');
        setNumQuestions(3);
        setNumOptions(3);
        setQuestions(Array.from({ length: 3 }, () => ({ questionText: '', options: ['', '', ''], correctOptionIndex: 0 })));
    };

    const startEditQuiz = (quiz) => {
        setEditingQuizId(quiz._id || quiz.id);
        setQuizTitle(quiz.title);
        const qs = quiz.questions || [];
        setNumQuestions(qs.length);
        setNumOptions(qs[0]?.options?.length || 3);
        setQuestions(qs.map(q => ({ questionText: q.questionText, options: [...q.options], correctOptionIndex: q.correctOptionIndex || 0 })));
        // Scroll to form
        setTimeout(() => document.getElementById('quiz-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!confirm('Are you sure you want to delete this quiz? This cannot be undone.')) return;
        try {
            await api.delete(`/quizzes/${quizId}`);
            setQuizzes(prev => prev.filter(q => (q._id || q.id) !== quizId));
            if (editingQuizId === quizId) resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete quiz.');
        }
    };

    const handleGenerateAiQuiz = async () => {
        if (!confirm('This will use AI to analyze the curriculum and generate a quiz. Continue?')) return;
        setGeneratingAi(true);
        try {
            const { data } = await api.post(`/quizzes/generate/${id}`, { targetLang: i18n.language });
            alert('AI Quiz generated successfully!');
            setQuizzes(prev => [...prev, data.quiz]);
        } catch (error) {
            console.error('AI Quiz Error:', error);
            const msg = error.response?.data?.message || error.message || 'Unknown Error';
            
            if (msg.includes('CONFIG_ERROR')) {
                alert('⚠️ AI CONFIGURATION ERROR:\n\nPlease add your API Key to backend/.env file to enable this feature.');
            } else {
                alert(`Assessment Error: ${msg}`);
            }
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleGenerateAiPaper = async () => {
        setGeneratingAi(true);
        try {
            const { data } = await api.post(`/quizzes/generate-paper/${id}`, { targetLang: i18n.language });
            const win = window.open('', '_blank');
            win.document.write(`
                <html>
                    <head><title>${data.title}</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;max-width:800px;margin:auto;}</style></head>
                    <body>
                        <h1>${data.title}</h1>
                        <pre style="white-space: pre-wrap;">${data.content}</pre>
                        <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;">Print Paper</button>
                    </body>
                </html>
            `);
            win.document.close();
        } catch (error) {
            console.error('AI Paper Error:', error);
            const msg = error.response?.data?.message || '';
            if (msg.includes('CONFIG_ERROR')) {
                alert('⚠️ AI CONFIGURATION ERROR:\n\nPlease add your OpenAI API Key to backend/.env file to enable this feature.');
            } else {
                alert(msg || 'Failed to generate question paper.');
            }
        } finally {
            setGeneratingAi(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading editor...</div>;
    if (!subject) return <div className="p-8 text-center text-red-500">Subject not found.</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 pb-32">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 bg-surface-950/90 backdrop-blur-md z-10 py-6 gap-4 border-b border-white/5">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <button onClick={() => navigate('/dashboard')} className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase">
                             Curriculum Studio
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Program:</span>
                            <select 
                                value={subject.category || 'General'}
                                onChange={(e) => setSubject({...subject, category: e.target.value})}
                                className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest px-3 py-1.5 outline-none text-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-indigo-500/20 shadow-lg shadow-indigo-500/5"
                            >
                                <option value="BSc" className="bg-surface-900 border-none">B.Sc Science</option>
                                <option value="BCA" className="bg-surface-900 border-none">BCA (Apps)</option>
                                <option value="BE" className="bg-surface-900 border-none">B.E Engineering</option>
                                <option value="General" className="bg-surface-900 border-none">General</option>
                            </select>
                            <span className="h-4 w-px bg-white/10 mx-2"></span>
                            <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">{subject.title}</p>
                        </div>
                    </div>
                </div>
                {activeTab === 'curriculum' && (
                    <button onClick={async () => {
                        setSaving(true);
                        try {
                            await api.put(`/subjects/${id}`, { units: subject.units, category: subject.category });
                            alert('Subject curriculum and category saved!');
                        } catch (err) { alert('Save failed'); }
                        finally { setSaving(false); }
                    }} disabled={saving} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3.5 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2">
                        <Save size={18} /> {saving ? 'Saving...' : 'Publish Changes'}
                    </button>
                )}
            </div>

            {/* Tab Switcher */}
            <div className="flex flex-col sm:flex-row gap-2 bg-surface-900 p-2 rounded-[2rem] border border-white/5 shadow-2xl">
                <button
                    onClick={() => setActiveTab('curriculum')}
                    className={`flex-1 flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl text-sm font-black transition-all duration-300 ${activeTab === 'curriculum'
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <BookOpen size={18} /> Curriculum Builder
                </button>
                <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`flex-1 flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl text-sm font-black transition-all duration-300 ${activeTab === 'quizzes'
                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20'
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <FileQuestion size={18} /> Assessment Suite
                </button>
            </div>

            {/* CURRICULUM TAB */}
            {activeTab === 'curriculum' && (
                <div className="space-y-6">
                    {subject.units.map((unit, uIdx) => (
                        <div key={uIdx} className="bg-surface-900 p-8 rounded-[2rem] border border-indigo-500/20 shadow-2xl">
                            <div className="flex items-center justify-between mb-8 group">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black">
                                        {uIdx + 1}
                                    </span>
                                    <input type="text" value={unit.title}
                                        onChange={(e) => { const u = [...subject.units]; u[uIdx].title = e.target.value; setSubject({ ...subject, units: u }); }}
                                        className="text-2xl font-black text-white bg-transparent border-none focus:ring-0 w-full hover:bg-white/5 rounded-xl px-3 py-1 transition-all"
                                        placeholder="Enter Unit Title" />
                                </div>
                            </div>
                            <div className="space-y-6 pl-10 border-l-2 border-white/5 ml-5">
                                {unit.chapters.map((chapter, cIdx) => (
                                    <div key={cIdx} className="bg-surface-850/50 p-6 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Chapter {cIdx + 1}</span>
                                            <input type="text" value={chapter.title}
                                                onChange={(e) => { const u = [...subject.units]; u[uIdx].chapters[cIdx].title = e.target.value; setSubject({ ...subject, units: u }); }}
                                                className="text-lg font-black text-slate-200 bg-transparent w-full hover:bg-white/5 rounded-lg px-2 py-1 transition-all"
                                                placeholder="Chapter Title" />
                                        </div>
                                        <div className="space-y-4">
                                            {chapter.sections.map((section, sIdx) => (
                                                <div key={sIdx} className="bg-surface-950 p-6 rounded-2xl border border-white/5 shadow-xl">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[10px] font-black">{sIdx + 1}</span>
                                                        <input type="text" value={section.title}
                                                            onChange={(e) => updateSection(uIdx, cIdx, sIdx, 'title', e.target.value)}
                                                            className="font-black text-white bg-transparent w-full hover:bg-white/5 rounded-lg px-2 py-1 transition-all"
                                                            placeholder="Section Title" />
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                                                                <Video size={14} /> Video Lesson Embed URL
                                                            </label>
                                                            <input type="text" value={section.videoUrl || ''}
                                                                onChange={(e) => updateSection(uIdx, cIdx, sIdx, 'videoUrl', e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all" 
                                                                placeholder="https://www.youtube.com/embed/..." />
                                                        </div>
                                                        <div>
                                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                                                                <FileText size={14} /> Course Narrative & Content
                                                            </label>
                                                            <div className="space-y-3">
                                                                {section.paragraphs.map((para, pIdx) => (
                                                                    <div key={pIdx} className="flex gap-3 items-start group/para">
                                                                        <textarea value={para}
                                                                            onChange={(e) => updateParagraph(uIdx, cIdx, sIdx, pIdx, e.target.value)}
                                                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all resize-none min-h-[80px]" 
                                                                            placeholder="Type your content..." />
                                                                        <button onClick={() => removeParagraph(uIdx, cIdx, sIdx, pIdx)}
                                                                            className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/para:opacity-100">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <div className="flex items-center gap-6 pt-2">
                                                                    <button onClick={() => addParagraph(uIdx, cIdx, sIdx)}
                                                                        className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors">
                                                                        <Plus size={14} /> Add Block
                                                                    </button>
                                                                    <label className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 flex items-center gap-2 cursor-pointer transition-colors">
                                                                        <Upload size={14} /> Attach PDF
                                                                        <input type="file" accept=".pdf" className="hidden"
                                                                            onChange={(e) => uploadPdf(uIdx, cIdx, sIdx, e.target.files[0])} />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => addSection(uIdx, cIdx)}
                                                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:text-slate-300 transition-all">
                                                <Plus size={16} className="inline mr-2" /> Add Section
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addChapter(uIdx)}
                                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-500/10 transition-all">
                                    <Plus size={16} className="inline mr-2" /> Add Chapter
                                </button>
                            </div>
                        </div>
                    ))}
                    <button onClick={addUnit}
                        className="w-full py-8 border-2 border-dashed border-white/10 rounded-[2rem] text-slate-500 text-sm font-black uppercase tracking-widest hover:bg-white/5 hover:text-slate-300 transition-all grid place-items-center gap-2">
                        <Plus size={40} />
                        Launch Content Unit
                    </button>
                </div>
            )}

            {/* QUIZZES TAB */}
            {activeTab === 'quizzes' && (
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-900 overflow-hidden rounded-[2rem] border border-indigo-500/20 shadow-2xl">
                        <div className="flex-1 p-8">
                            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Generate Smarter Assessments</h3>
                            <p className="text-sm text-slate-500 font-bold mb-6">Use AI to analyze your curriculum and automatically create validated MCQs or formal question papers.</p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleGenerateAiQuiz}
                                    disabled={generatingAi}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                >
                                    {generatingAi ? 'Analyzing curriculum...' : 'Generate AI Quiz'}
                                </button>
                                <button
                                    onClick={handleGenerateAiPaper}
                                    disabled={generatingAi}
                                    className="bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all border border-white/10 disabled:opacity-50"
                                >
                                    {generatingAi ? 'Drafting...' : 'Generate AI Paper'}
                                </button>
                            </div>
                        </div>
                        <div className="w-full sm:w-64 h-48 sm:h-auto bg-gradient-to-br from-indigo-500 to-emerald-500 opacity-20 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileQuestion size={80} className="text-white opacity-20" />
                            </div>
                        </div>
                    </div>

                    {quizzes.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Global Assessments</h3>
                            {quizzes.map((quiz, qIdx) => (
                                <div key={quiz._id || qIdx} className={`flex items-center justify-between p-6 bg-surface-900 rounded-[2rem] border transition-all duration-300 ${editingQuizId === (quiz._id || quiz.id) ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20' : 'border-white/5 shadow-xl hover:border-white/10'}`}>
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
                                            {qIdx + 1}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-lg">{quiz.title}</p>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{quiz.questions?.length || 0} Questions • Validated MCQ</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => startEditQuiz(quiz)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteQuiz(quiz._id || quiz.id)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmitQuiz} id="quiz-form" className="space-y-8 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
                                    {editingQuizId ? 'Edit Performance Assessment' : 'New Assessment Configuration'}
                                </h3>
                            </div>
                            {editingQuizId && (
                                <button type="button" onClick={resetForm} className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 transition-all">
                                    <X size={14} className="inline mr-1" /> Reset Form
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface-900 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Assessment Reference</label>
                                <input type="text" required value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all font-bold" placeholder="e.g. Mid-Term Proficiency Exam" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Complexity (Questions)</label>
                                <input type="number" min={1} max={50} value={numQuestions}
                                    onChange={(e) => handleNumQuestionsChange(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500/50 outline-none transition-all font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Choice Density</label>
                                <input type="number" min={2} max={8} value={numOptions}
                                    onChange={(e) => handleNumOptionsChange(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500/50 outline-none transition-all font-bold" />
                            </div>
                        </div>

                        {questions.map((q, qIdx) => (
                            <div key={qIdx} className="bg-surface-900 rounded-[2rem] border border-white/5 p-8 shadow-2xl space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/20">
                                        {qIdx + 1}
                                    </span>
                                    <h4 className="text-lg font-black text-white">Question Narrative</h4>
                                </div>
                                <input type="text" required value={q.questionText}
                                    onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500/50 outline-none transition-all font-bold" placeholder="High-impact question text goes here..." />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${q.correctOptionIndex === oIdx ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                            <input type="radio" name={`correct-${qIdx}`} checked={q.correctOptionIndex === oIdx} onChange={() => updateQuestion(qIdx, 'correctOptionIndex', oIdx)}
                                                className="w-6 h-6 accent-emerald-500 cursor-pointer" />
                                            <input type="text" required value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                className="flex-1 bg-transparent text-sm font-black text-slate-200 outline-none" placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 px-1">
                                    <CheckCircle2 size={12} className="text-emerald-500" /> Verify the correct response marker
                                </p>
                            </div>
                        ))}

                        <button type="submit" disabled={submittingQuiz}
                            className={`w-full py-6 text-white font-black text-lg rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 disabled:opacity-50 ${editingQuizId ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}>
                            {submittingQuiz ? 'Processing...' : editingQuizId ? 'Update Performance Assessment' : 'Finalize & Deploy Quiz'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SubjectEditor;
