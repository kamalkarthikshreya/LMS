const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'no_key');

const RAG_BASE_URL = 'https://rag-new-ajd8.onrender.com';

// ─── Keyword-based extractive QA (no API key required) ──────────────────────
const STOP_WORDS = new Set([
    'a','an','the','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','could','should','may','might','shall','can',
    'what','which','who','whom','this','that','these','those','i','you','he','she',
    'it','we','they','me','him','her','us','them','my','your','his','its','our',
    'their','in','on','at','to','for','of','with','by','from','up','about','into',
    'than','so','and','but','or','not','no','if','then','as','how','when','where',
    'why','please','tell','explain','describe','give','show','list'
]);

const extractKeywords = (text) =>
    text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));

const extractiveAnswer = async (context, question) => {
    const qKeywords = extractKeywords(question);
    
    // Fallback to Wikipedia for general knowledge using 2-step search
    const fetchWikipedia = async (searchTerm) => {
        try {
            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&utf8=&format=json&origin=*`);
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
                    const bestTitle = searchData.query.search[0].title;
                    const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`);
                    if (summaryRes.ok) {
                        const summaryData = await summaryRes.json();
                        if (summaryData.extract) {
                            return `[General Knowledge - ${bestTitle}]: ${summaryData.extract}`;
                        }
                    }
                }
            }
        } catch (e) { console.error('Wikipedia Fetch Error:', e); }
        return "I could not find information about that in the course material, and I couldn't reach the encyclopedia.";
    };

    if (qKeywords.length === 0) {
        return "Could you please be more specific? Try asking about a particular concept.";
    }

    if (!context || context.trim().length < 10) {
        return await fetchWikipedia(qKeywords.join(' '));
    }

    const sentences = context
        .replace(/([.!?])\s+/g, '$1\n')
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 15);

    if (sentences.length === 0) {
        return await fetchWikipedia(qKeywords.join(' '));
    }

    const scored = sentences.map((sentence, idx) => {
        const sWords = extractKeywords(sentence);
        const matchCount = qKeywords.filter(kw =>
            sWords.some(sw => sw.includes(kw) || kw.includes(sw))
        ).length;
        const score = matchCount * 2 + sWords.length * 0.1 - idx * 0.05;
        return { sentence, score, matchCount };
    });

    scored.sort((a, b) => b.score - a.score);
    const topSentences = scored
        .filter(s => s.matchCount > 0)
        .slice(0, 3)
        .map(s => s.sentence);

    if (topSentences.length === 0) {
        return await fetchWikipedia(qKeywords.join(' '));
    }

    return topSentences.join(' ');
};

// @desc    Ask a question contextually locked to subject section
// @route   POST /api/ai/ask
// @access  Private/Student
const askContextualQuestion = async (req, res) => {
    try {
        const { query, context, history = [] } = req.body;

        const hasKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('AIzaSy');

        if (!hasKey) {
            console.warn('AI Chat: No API Key. Using extractive fallback.');
            const answer = await extractiveAnswer(context || '', query);
            return res.json({ 
                answer, 
                isLocal: true,
                message: 'Local Mode: Using course-direct retrieval.'
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({ 
            history: history.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(m.content) }],
            }))
        });

        const result = await chat.sendMessage(query);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error('AI Chat Error:', error.message);
        const answer = await extractiveAnswer(req.body.context || '', req.body.query);
        res.json({ answer, isFallback: true });
    }
};

const ragAsk = async (req, res) => {
    try {
        const response = await fetch(`${RAG_BASE_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        res.status(500).json({ answer: 'Error connecting to RAG service.' });
    }
};

// ─── Local Translation Dictionary (DEMO MODE) ─────────────────────────────
const HARDCODED_TRANSLATIONS = {
    'kn': {
        "Newtonian Mechanics Quiz": "ನ್ಯೂಟೋನಿಯನ್ ಮೆಕ್ಯಾನಿಕ್ಸ್ ರಸಪ್ರಶ್ನೆ",
        "What is the formula for Force according to Newton's Second Law?": "ನ್ಯೂಟನ್ ಅವರ ಎರಡನೇ ನಿಯಮದ ಪ್ರಕಾರ ಬಲದ ಸೂತ್ರ ಯಾವುದು?",
        "Newton's second law states that Force is the product of mass and acceleration.": "ಬಲವು ದ್ರವ್ಯರಾಶಿ ಮತ್ತು ವೇಗವರ್ಧನೆಯ ಗುಣಲಬ್ಧವಾಗಿದೆ ಎಂದು ನ್ಯೂಟನ್ ರ ಎರಡನೇ ನಿಯಮ ಹೇಳುತ್ತದೆ.",
        "Atomic structure Quiz": "ಪರಮಾಣು ರಚನೆಯ ರಸಪ್ರಶ್ನೆ",
        "Which particle has a negative charge?": "ಯಾವ ಕಣವು ಋಣಾತ್ಮಕ ಆವೇಶವನ್ನು ಹೊಂದಿದೆ?",
        "Electrons carry a negative electrical charge.": "ಎಲೆಕ್ಟ್ರಾನ್ಗಳು ಋಣಾತ್ಮಕ ವಿದ್ಯುತ್ ಆವೇಶವನ್ನು ಹೊಂದಿರುತ್ತವೆ.",
        "Proton": "ಪ್ರೋಟಾನ್",
        "Neutron": "ನ್ಯೂಟ್ರಾನ್",
        "Electron": "ಎಲೆಕ್ಟ್ರಾನ್",
        "Nucleus": "ನ್ಯೂಕ್ಲಿಯಸ್"
    },
    'hi': {
        "Newtonian Mechanics Quiz": "न्यूटनियन मैकेनिक्स प्रश्नोत्तरी",
        "What is the formula for Force according to Newton's Second Law?": "न्यूटन के दूसरे नियम के अनुसार बल का सूत्र क्या है?",
        "Atomic structure Quiz": "परमाणु संरचना प्रश्नोत्तरी",
        "Which particle has a negative charge?": "किस कण पर ऋणात्मक आवेश होता है?",
        "Electron": "इलेक्ट्रॉन"
    }
};

// @desc    Translate curriculum content on-the-fly
// @route   POST /api/ai/translate
// @access  Private/Student
const translateContent = async (req, res) => {
    try {
        const { text, targetLang, isJson } = req.body;

        if (!text || !targetLang) {
            return res.status(400).json({ message: 'Text and target language are required.' });
        }

        if (targetLang === 'en') {
            return res.json({ translatedText: text });
        }

        // Try Hardcoded Dictionary First (for Demo subjects)
        const dict = HARDCODED_TRANSLATIONS[targetLang];
        if (dict) {
            if (isJson) {
                try {
                    const obj = JSON.parse(text);
                    const translateObj = (data) => {
                        if (typeof data === 'string' && dict[data]) return dict[data];
                        if (Array.isArray(data)) return data.map(translateObj);
                        if (typeof data === 'object' && data !== null) {
                            const newObj = {};
                            for (let k in data) newObj[k] = translateObj(data[k]);
                            return newObj;
                        }
                        return data;
                    };
                    return res.json({ translatedText: JSON.stringify(translateObj(obj), null, 2), isLocal: true });
                } catch (e) { /* fallback to normal */ }
            } else if (dict[text]) {
                return res.json({ translatedText: dict[text], isLocal: true });
            }
        }

        // If no API key, return original text blindly but safely
        const hasKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('AIzaSy');
        if (!hasKey) {
            console.warn(`Local Translation: No key for ${targetLang}. Returning original.`);
            return res.json({ translatedText: text, isLocal: true });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let prompt;
        if (isJson) {
            prompt = `Translate the string values in this JSON to ${targetLang}. Return ONLY valid JSON: ${text}`;
        } else {
            prompt = `Translate this to ${targetLang}: "${text}"`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let translatedText = response.text();

        if (isJson) {
            const jsonMatch = translatedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            if (jsonMatch) translatedText = jsonMatch[0];
        }

        res.json({ translatedText });
    } catch (error) {
        res.json({ translatedText: req.body.text, isLocal: true });
    }
};

const ragReloadDb = async (req, res) => {
    try {
        const response = await fetch(`${RAG_BASE_URL}/reload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        return res.json({ message: 'RAG reload skipped (service unavailable).' });
    }
};

module.exports = {
    askContextualQuestion,
    translateContent,
    ragAsk,
    ragReloadDb,
};
