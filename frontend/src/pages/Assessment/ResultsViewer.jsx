import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, CheckCircle2 } from 'lucide-react';

const ResultsViewer = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const { data } = await api.get('/results/me');
            setResults(data);
        } catch (error) {
            console.error('Error fetching results', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your performance data...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award className="text-primary-600" /> My Results History
            </h1>

            {results.length === 0 ? (
                <div className="card p-12 text-center text-slate-500">
                    You haven't attempted any quizzes yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map((result) => (
                        <div key={result._id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{result.quizId?.title || 'Unknown Quiz'}</h3>
                                <p className="text-sm text-slate-500">{result.subjectId?.title || 'Unknown Subject'}</p>
                                <div className="mt-2 text-xs text-slate-400">
                                    Attempted on {new Date(result.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl">
                                <div className="text-center">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Score</div>
                                    <div className="text-xl font-bold text-slate-900">{result.score} / {result.answers.length}</div>
                                </div>
                                <div className="w-px h-10 bg-slate-200"></div>
                                <div className="text-center">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Percentage</div>
                                    <div className={`text-xl font-bold ${result.percentage >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {result.percentage}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResultsViewer;
