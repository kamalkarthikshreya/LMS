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
                query
            });

            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI service.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 lg:right-10 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-fade-in-up" style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}>
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-primary-400" />
                    <span className="font-bold">Subject AI Tutor</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                            }`}>
                            {msg.role === 'assistant' && (
                                <div className="flex items-center gap-1 mb-1 text-xs font-bold text-slate-400">
                                    <Bot size={12} /> AI
                                </div>
                            )}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 text-slate-400 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2 w-full">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 border-slate-200 rounded-full text-sm focus:ring-primary-500"
                    disabled={loading || !contextText}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition-colors shrink-0"
                >
                    <Send size={16} className="ml-0.5" />
                </button>
            </form>
        </div>
    );
};

export default AiChatbox;
