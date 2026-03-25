import { useState } from "react";
import api from "../services/api";

const ChatBot = ({ subjectId, contextText }) => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const askQuestion = async () => {
        if (!question.trim()) return;
        setLoading(true);
        setAnswer("");
        try {
            const { data } = await api.post("/ai/ask", {
                subjectId,
                context: contextText || "",
                query: question
            });
            setAnswer(data.answer || "No answer returned.");
        } catch (err) {
            setAnswer("Error getting response. Please try again.");
        }
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            askQuestion();
        }
    };

    return (
        <div className="mt-8 p-6 rounded-[2rem] bg-surface-850/50 border border-white/10 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <span className="text-xs font-black">AI</span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">Ask AI about this subject</h3>
            </div>

            <div className="relative">
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What would you like to know?"
                    className="w-full bg-surface-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
                <button 
                    onClick={askQuestion} 
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Thinking...</span>
                        </>
                    ) : (
                        <span>Ask AI</span>
                    )}
                </button>
            </div>

            {answer && (
                <div className="mt-6 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 animate-fade-in">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Answer</p>
                    <div className="text-slate-200 leading-relaxed font-medium">
                        {answer}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
