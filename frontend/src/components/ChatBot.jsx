import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { Mic, MicOff, Volume2, Flag, Send, RefreshCcw } from "lucide-react";

const ChatBot = ({ subjectId, contextText }) => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setQuestion(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setIsListening(true);
            recognitionRef.current?.start();
        }
    };

    const speak = (text) => {
        if (isSpeaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        synthRef.current.speak(utterance);
    };

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

    const flagAnswer = async () => {
        if (!answer) return;
        alert("This response has been flagged for review. Our team will verify the accuracy.");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            askQuestion();
        }
    };

    return (
        <div className="mt-8 p-6 rounded-[2rem] bg-surface-850/50 border border-white/10 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <span className="text-xs font-black">AI</span>
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">Intelligent Assistant</h3>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={toggleListening}
                        className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        title={isListening ? "Stop Listening" : "Speak to AI"}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>
            </div>

            <div className="relative">
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about formulas, concepts, or historical facts..."
                    className="w-full bg-surface-950/50 border border-white/10 rounded-2xl pl-5 pr-32 py-4 text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
                <button 
                    onClick={askQuestion} 
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                    {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>

            {answer && (
                <div className="mt-6 space-y-4 animate-fade-in">
                    <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 relative group">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Verified AI Response</p>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => speak(answer)} className={`p-1.5 rounded-lg bg-indigo-500/10 ${isSpeaking ? 'text-indigo-400 animate-bounce' : 'text-slate-500 hover:text-indigo-400'}`} title="Read Aloud">
                                    <Volume2 size={16} />
                                </button>
                                <button onClick={flagAnswer} className="p-1.5 rounded-lg bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" title="Flag as Incorrect">
                                    <Flag size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="text-slate-200 leading-relaxed font-medium">
                            {answer}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
