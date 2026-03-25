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
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, marginTop: 20 }}>
            <h3>Ask AI about this subject</h3>

            <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            />

            <button onClick={askQuestion} disabled={loading} style={{ marginTop: 10 }}>
                {loading ? "Thinking..." : "Ask"}
            </button>

            {answer && (
                <p style={{ marginTop: 10 }}>
                    <strong>Answer:</strong> {answer}
                </p>
            )}
        </div>
    );
};

export default ChatBot;
