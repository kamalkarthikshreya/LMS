import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';

const AiChatbox = ({ contextText, subjectId, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Subject Assistant. Ask me anything about the current section you are reading.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const query = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/ai/ask', {
                subjectId,
                context: contextText,
                query,
                history: messages.slice(1)
            });

            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI service.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 lg:right-10 w-80 sm:w-96 bg-surface-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden z-50 animate-fade-in-up" style={{ height: '550px', maxHeight: 'calc(100vh - 120px)' }}>
            {/* Header */}
            <div className="bg-surface-950 text-white p-5 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Bot size={18} />
                    </div>
                    <span className="font-black tracking-tight">Subject AI Tutor</span>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-surface-900/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-600/20'
                                : 'bg-surface-850 border border-white/5 text-slate-200 rounded-bl-sm shadow-xl'
                            }`}>
                            {msg.role === 'assistant' && (
                                <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    <Bot size={12} /> AI ASSISTANT
                                </div>
                            )}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface-850 border border-white/5 text-slate-400 rounded-2xl rounded-bl-sm px-5 py-4 shadow-xl flex items-center gap-3">
                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                            <span className="text-xs font-bold uppercase tracking-widest">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-surface-950 flex gap-2 w-full">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-white/5 border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all px-4"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 shrink-0"
                >
                    <Send size={16} className="ml-0.5" />
                </button>
            </form>
        </div>
    );
};

export default AiChatbox;
