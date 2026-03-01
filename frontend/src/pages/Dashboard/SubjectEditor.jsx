import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, Plus, Trash2, Video, FileText } from 'lucide-react';

const SubjectEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSubject = async () => {
            try {
                const { data } = await api.get(`/subjects/${id}`);
                setSubject({
                    ...data,
                    units: data.units || []
                });
            } catch (error) {
                console.error('Error fetching subject', error);
                alert('Failed to load subject data.');
            } finally {
                setLoading(false);
            }
        };
        fetchSubject();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/subjects/${id}`, { units: subject.units });
            alert('Subject curriculum saved successfully!');
        } catch (error) {
            console.error('Error saving subject', error);
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const addUnit = () => {
        setSubject(prev => ({
            ...prev,
            units: [
                ...prev.units,
                {
                    unitNumber: prev.units.length + 1,
                    title: 'New Unit',
                    chapters: []
                }
            ]
        }));
    };

    const addChapter = (unitIndex) => {
        const newUnits = [...subject.units];
        newUnits[unitIndex].chapters.push({
            chapterNumber: newUnits[unitIndex].chapters.length + 1,
            title: 'New Chapter',
            sections: []
        });
        setSubject({ ...subject, units: newUnits });
    };

    const addSection = (unitIndex, chapterIndex) => {
        const newUnits = [...subject.units];
        newUnits[unitIndex].chapters[chapterIndex].sections.push({
            sectionNumber: newUnits[unitIndex].chapters[chapterIndex].sections.length + 1,
            title: 'New Section',
            videoUrl: '',
            paragraphs: ['']
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

    if (loading) return <div className="p-8 text-center text-slate-500">Loading curriculum editor...</div>;
    if (!subject) return <div className="p-8 text-center text-red-500">Subject not found.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 pb-32">
            <div className="flex items-center justify-between sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md z-10 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Curriculum</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{subject.title}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary gap-2"
                >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-6">
                {subject.units.map((unit, uIdx) => (
                    <div key={uIdx} className="card p-6 border border-primary-200 dark:border-primary-900/50">
                        <div className="flex items-center justify-between mb-4">
                            <input
                                type="text"
                                value={unit.title}
                                onChange={(e) => {
                                    const newUnits = [...subject.units];
                                    newUnits[uIdx].title = e.target.value;
                                    setSubject({ ...subject, units: newUnits });
                                }}
                                className="text-xl font-bold text-primary-700 dark:text-primary-400 bg-transparent edit-focus-ring border-none focus:ring-0 w-full"
                                placeholder="Unit Title"
                            />
                        </div>

                        <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                            {unit.chapters.map((chapter, cIdx) => (
                                <div key={cIdx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                    <input
                                        type="text"
                                        value={chapter.title}
                                        onChange={(e) => {
                                            const newUnits = [...subject.units];
                                            newUnits[uIdx].chapters[cIdx].title = e.target.value;
                                            setSubject({ ...subject, units: newUnits });
                                        }}
                                        className="text-lg font-semibold text-slate-800 dark:text-slate-200 bg-transparent w-full mb-3"
                                        placeholder="Chapter Title"
                                    />

                                    <div className="space-y-3 pl-4">
                                        {chapter.sections.map((section, sIdx) => (
                                            <div key={sIdx} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(e) => updateSection(uIdx, cIdx, sIdx, 'title', e.target.value)}
                                                    className="font-semibold text-slate-900 dark:text-slate-100 bg-transparent w-full mb-4 pt-1"
                                                    placeholder="Section Title"
                                                />

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                            <Video size={16} /> Embed Video URL (YouTube, Vimeo)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={section.videoUrl || ''}
                                                            onChange={(e) => updateSection(uIdx, cIdx, sIdx, 'videoUrl', e.target.value)}
                                                            className="input-field text-sm py-2"
                                                            placeholder="https://www.youtube.com/embed/..."
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                                            <FileText size={16} /> Text Content Paragraphs (AI Context)
                                                        </label>
                                                        <div className="space-y-2">
                                                            {section.paragraphs.map((para, pIdx) => (
                                                                <div key={pIdx} className="flex gap-2 items-start">
                                                                    <textarea
                                                                        value={para}
                                                                        onChange={(e) => updateParagraph(uIdx, cIdx, sIdx, pIdx, e.target.value)}
                                                                        className="input-field text-sm py-2 resize-y min-h-[60px]"
                                                                        placeholder="Enter text, LaTeX math formulas, etc."
                                                                    />
                                                                    <button
                                                                        onClick={() => removeParagraph(uIdx, cIdx, sIdx, pIdx)}
                                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors mt-1"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => addParagraph(uIdx, cIdx, sIdx)}
                                                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium flex items-center gap-1"
                                                            >
                                                                <Plus size={14} /> Add Paragraph
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addSection(uIdx, cIdx)}
                                            className="btn-secondary text-sm py-2 px-4 shadow-none w-full border-dashed"
                                        >
                                            <Plus size={16} className="mr-2" /> Add Section
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => addChapter(uIdx)}
                                className="btn-secondary text-sm py-2 px-4 shadow-none border-dashed text-primary-600 border-primary-200 mt-2"
                            >
                                <Plus size={16} className="mr-2" /> Add Chapter
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addUnit}
                    className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add New Unit
                </button>
            </div>
        </div>
    );
};

export default SubjectEditor;
