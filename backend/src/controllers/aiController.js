const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

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
            // Step 1: Search Wikipedia to resolve typos/acronyms (e.g. "rdms") to exact articles (e.g. "RDBMS")
            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&utf8=&format=json&origin=*`);
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
                    const bestTitle = searchData.query.search[0].title;
                    
                    // Step 2: Fetch the summary of the exact matched title
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
        // No course text (e.g., video-only section) -> rely entirely on Wikipedia
        return await fetchWikipedia(qKeywords.join(' '));
    }

    // Split context into sentences
    const sentences = context
        .replace(/([.!?])\s+/g, '$1\n')
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 15);

    if (sentences.length === 0) {
        return await fetchWikipedia(qKeywords.join(' '));
    }

    // Score each sentence by keyword overlap + boost for longer, richer sentences
    const scored = sentences.map((sentence, idx) => {
        const sWords = extractKeywords(sentence);
        const matchCount = qKeywords.filter(kw =>
            sWords.some(sw => sw.includes(kw) || kw.includes(sw))
        ).length;
        const score = matchCount * 2 + sWords.length * 0.1 - idx * 0.05;
        return { sentence, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topSentences = scored.slice(0, 3).filter(s => s.score > 0).map(s => s.sentence);

    if (topSentences.length === 0) {
        // If course material has text but doesn't mention this topic, check Wikipedia
        return await fetchWikipedia(qKeywords.join(' '));
    }

    return topSentences.join(' ');
};
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Ask a question contextually locked to subject section
// @route   POST /api/ai/ask
// @access  Private/Student
const askContextualQuestion = async (req, res) => {
    try {
        const { subjectId, context, query, history = [] } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Use extractive QA (with Wikipedia fallback) when no OpenAI key is set
        if (!process.env.OPENAI_API_KEY) {
            let contextualQuery = query;
            const currentKeywords = extractKeywords(query);
            const queryLower = query.toLowerCase();
            
            // Detect if user wants brief or detailed response
            const wantsBrief = /\b(brief|briefly|short|shortly|summary|summarize|summarise|concise|concisely|quick|quickly|one.?line|tldr)\b/i.test(queryLower);
            const wantsDetail = !wantsBrief && /\b(detail|detailed|elaborate|depth|expand|thorough|comprehensive|in.?depth)\b/i.test(queryLower);
            
            // Fix conversation context loss for short follow-up questions (e.g., "explain briefly")
            if (currentKeywords.length <= 1 && history.length > 0) {
                const userMsgs = history.filter(m => m.role === 'user');
                if (userMsgs.length > 0) {
                    const lastMsg = userMsgs[userMsgs.length - 1].content;
                    contextualQuery = `${lastMsg} ${query}`;
                }
            }
            
            let answer = await extractiveAnswer(context || '', contextualQuery);
            
            // Post-process: if this is a follow-up request (explain, briefly, more detail, etc.), 
            // provide a RICHER, LONGER answer from Wikipedia's full intro section
            const isFollowUp = history.length > 0 && (
                /\b(brief|briefly|explain|more|detail|elaborate|expand|depth|short|summary|comprehensive)\b/i.test(queryLower)
            );
            
            if (isFollowUp && answer.includes('[General Knowledge')) {
                // Extract the topic from the previous answer to search Wikipedia for richer content
                const topicKeywords = extractKeywords(contextualQuery);
                if (topicKeywords.length > 0) {
                    try {
                        // Use Wikipedia's TextExtracts API to get full intro section (much longer than summary)
                        const wikiRes = await fetch(
                            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topicKeywords.join(' '))}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*&redirects=1`
                        );
                        if (wikiRes.ok) {
                            const wikiData = await wikiRes.json();
                            const pages = wikiData.query?.pages;
                            if (pages) {
                                const page = Object.values(pages)[0];
                                if (page && page.extract && page.extract.length > 50) {
                                    answer = `[${page.title} - Explained]: ${page.extract}`;
                                }
                            }
                        }
                        
                        // If the direct title didn't work, search first then extract
                        if (answer.includes('[General Knowledge')) {
                            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topicKeywords.join(' '))}&utf8=&format=json&origin=*`);
                            if (searchRes.ok) {
                                const searchData = await searchRes.json();
                                if (searchData.query?.search?.length > 0) {
                                    const bestTitle = searchData.query.search[0].title;
                                    const extractRes = await fetch(
                                        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(bestTitle)}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*&redirects=1`
                                    );
                                    if (extractRes.ok) {
                                        const extractData = await extractRes.json();
                                        const pages2 = extractData.query?.pages;
                                        if (pages2) {
                                            const page2 = Object.values(pages2)[0];
                                            if (page2 && page2.extract && page2.extract.length > 50) {
                                                answer = `[${page2.title} - Explained]: ${page2.extract}`;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (e) { /* use original answer */ }
                }
            }
            
            return res.json({ answer });
        }

        if (!context) {
            return res.status(400).json({ message: 'Context is required' });
        }

        const systemPrompt = `You are a helpful teaching assistant for a college course. 
Using STRICTLY the context below from the course material, answer the student's question. 
If the answer cannot be determined from the context alone, reply EXACTLY with: 'I cannot find the answer in the provided course material.' Do not invent answers or use outside knowledge.

Course Context:
${context}
`;

        const chatHistory = history.map(m => ({
            role: m.role,
            content: String(m.content)
        }));

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...chatHistory,
                { role: 'user', content: query }
            ],
            temperature: 0.1,
            max_tokens: 300,
        });

        res.json({ answer: response.choices[0].message.content });
    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({ message: 'Failed to process AI request. Make sure OPENAI_API_KEY is valid.' });
    }
};

// @desc    Proxy: Ask RAG chatbot a question (bypasses browser CORS)
// @route   POST /api/ai/rag-ask
// @access  Private/Student
const ragAsk = async (req, res) => {
    try {
        console.log('RAG Proxy Request:', JSON.stringify(req.body));
        const response = await fetch(`${RAG_BASE_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('RAG Proxy Success:', data);
            return res.status(response.status).json(data);
        } else {
            const text = await response.text();
            console.error('RAG Proxy Non-JSON Response:', text);
            return res.status(response.status).json({ answer: 'Error: RAG server returned non-JSON response.', details: text });
        }
    } catch (error) {
        console.error('RAG ask proxy error:', error);
        res.status(500).json({ answer: 'Error connecting to RAG service.', error: error.message });
    }
};

// @desc    Proxy: Trigger RAG database reload after content update (bypasses browser CORS)
// @route   POST /api/ai/rag-reload
// @access  Private/Instructor
const ragReloadDb = async (req, res) => {
    try {
        console.log('RAG Reload Triggered');
        const response = await fetch(`${RAG_BASE_URL}/reload-db`, { method: 'POST' });
        const text = await response.text();
        console.log('RAG Reload Success:', text);
        res.status(response.status).send(text);
    } catch (error) {
        console.error('RAG reload proxy error:', error);
        res.status(500).json({ message: 'Error triggering RAG reload.', error: error.message });
    }
};

module.exports = {
    askContextualQuestion,
    ragAsk,
    ragReloadDb,
};
