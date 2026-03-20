(function () {
    const STORAGE_KEY = 'ask-yangming-history';
    const PANEL_OPEN_KEY = 'ask-yangming-open';
    const MAX_HISTORY_ITEMS = 8;
    const API_PATH = '/api/ask-yangming';
    const QUICK_PROMPTS = [
        'What do you build?',
        'Which posts should I read if I care about MLOps and LLM workflows?',
        'How can I contact you for AI or data work?'
    ];
    const EMBEDDED_KNOWLEDGE = [
        {
            id: 'profile-overview',
            title: 'Yangming Li Overview',
            url: '/index.html#about-me',
            tags: ['profile', 'about', 'ai', 'ml', 'product', 'data'],
            alwaysInclude: true,
            content: 'Yangming Li is an AI Engineer and Product Builder based in Vancouver. The site positions him around applied AI systems for real-world workflows, especially LLM systems, statistical ML, data engineering, data products, and experiment infrastructure.'
        },
        {
            id: 'profile-builds-serves-outcomes',
            title: 'What Yangming Builds and Who He Serves',
            url: '/index.html#about-me',
            tags: ['llm systems', 'statistical ml', 'data engineering', 'data products', 'experiment infrastructure', 'healthcare', 'finance', 'enterprise'],
            content: 'The homepage highlights three groups of information: builds, serves, and outcomes. Builds include LLM systems, statistical ML, data engineering, data products, and experiment infrastructure. Serves include healthcare teams, finance teams, and enterprise teams. Outcomes include shipped workflows, faster decision loops, and reusable internal tooling.'
        },
        {
            id: 'contact-options',
            title: 'Contact Yangming',
            url: '/index.html#contact',
            tags: ['contact', 'email', 'linkedin', 'github', 'scholar', 'meeting'],
            alwaysInclude: true,
            content: 'Visitors can reach Yangming through email at liym1@hotmail.com, through LinkedIn, through GitHub, or by booking time on Calendly from the contact tab. The contact section also notes Vancouver, BC, Canada as location.'
        },
        {
            id: 'work-style',
            title: 'How Yangming Frames His Work',
            url: '/index.html#about-me',
            tags: ['applied ai', 'workflow', 'product thinking', 'platforms', 'delivery'],
            content: 'The hero and about sections describe Yangming as someone working at the intersection of AI engineering, statistical ML, data engineering, and product thinking to ship systems teams can actually use, from LLM-powered workflows to experiment-ready data platforms.'
        },
        {
            id: 'mlops-article',
            title: 'MLOps Essential Skills',
            url: '/mlops-essential-skills.html',
            tags: ['mlops', 'deployment', 'monitoring', 'infrastructure', 'data engineering'],
            content: 'This article covers practical MLOps capabilities and is a strong recommendation for visitors who care about production machine learning, deployment workflows, model operations, and the engineering side of AI systems.'
        },
        {
            id: 'n8n-article',
            title: 'n8n AI Workflows',
            url: '/n8n-ai-workflows.html',
            tags: ['ai workflows', 'automation', 'agents', 'llm', 'integration'],
            content: 'This article is relevant for people exploring workflow automation, orchestration, and AI-enabled process design. It is especially relevant if the visitor is interested in turning LLM capability into business workflows.'
        },
        {
            id: 'mcp-article',
            title: 'MCP Protocol Guide',
            url: '/mcp-protocol-guide.html',
            tags: ['mcp', 'protocol', 'agent tools', 'tool use', 'integration'],
            content: 'This guide is a good fit for visitors asking about AI agents, tool calling, or how models connect to external systems. It helps position Yangming as someone who thinks about system integration rather than just isolated prompts.'
        },
        {
            id: 'machine-unlearning-article',
            title: 'Machine Unlearning Guide',
            url: '/machine-unlearning-guide.html',
            tags: ['machine learning', 'privacy', 'safety', 'compliance', 'ml systems'],
            content: 'This piece is relevant to visitors interested in responsible AI, model maintenance, privacy-sensitive systems, and how machine learning systems behave after deployment.'
        },
        {
            id: 'databricks-article',
            title: 'Databricks Comprehensive Guide',
            url: '/databricks-comprehensive-guide.html',
            tags: ['databricks', 'data engineering', 'analytics', 'platforms'],
            content: 'This article is a strong recommendation when the user asks about data platforms, data engineering, and scalable analytics workflows.'
        },
        {
            id: 'polars-article',
            title: 'Polars Guide',
            url: '/polars-guide.html',
            tags: ['polars', 'dataframes', 'data engineering', 'analytics'],
            content: 'This guide is a useful recommendation for users interested in data tooling, dataframe performance, and practical analytics engineering.'
        },
        {
            id: 'python-package-article',
            title: 'From Zero to One: Building and Publishing a Python Package',
            url: '/engineering/python-package-guide.html',
            tags: ['python', 'engineering', 'packaging', 'developer tooling'],
            content: 'This engineering article is relevant when a visitor asks about Python tooling, packaging, library design, or software engineering practices.'
        },
        {
            id: 'ab-test-article',
            title: 'A/B Test Engineering Guide',
            url: '/engineering/ab-test-engineering-guide.html',
            tags: ['experimentation', 'ab testing', 'product', 'measurement', 'decision making'],
            content: 'This article is a good match for visitors asking about experiment infrastructure, product measurement, decision loops, and data-informed product work.'
        }
    ];
    const STOP_WORDS = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'how',
        'i', 'if', 'in', 'into', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'so', 'that',
        'the', 'their', 'this', 'to', 'we', 'what', 'when', 'where', 'which', 'who',
        'why', 'with', 'you', 'your'
    ]);

    document.addEventListener('DOMContentLoaded', function () {
        const shell = document.querySelector('[data-ask-yangming]');
        if (!shell) {
            return;
        }

        const launcher = shell.querySelector('[data-ask-yangming-launcher]');
        const panel = shell.querySelector('[data-ask-yangming-panel]');
        const closeButton = shell.querySelector('[data-ask-yangming-close]');
        const resetButton = shell.querySelector('[data-ask-yangming-reset]');
        const messages = shell.querySelector('[data-ask-yangming-messages]');
        const quickPrompts = shell.querySelector('[data-ask-yangming-prompts]');
        const form = shell.querySelector('[data-ask-yangming-form]');
        const input = shell.querySelector('[data-ask-yangming-input]');
        const status = shell.querySelector('[data-ask-yangming-status]');
        const submitButton = shell.querySelector('[data-ask-yangming-submit]');
        const heroTriggers = document.querySelectorAll('[data-ask-yangming-open]');
        const apiBase = normalizeApiBase(
            shell.getAttribute('data-api-base') ||
            window.ASK_YANGMING_API_BASE ||
            document.documentElement.getAttribute('data-ask-yangming-api-base') ||
            ''
        );
        const assistantMode = normalizeAssistantMode(shell.getAttribute('data-assistant-mode') || 'static');

        let history = loadHistory();
        let isSending = false;
        let knowledgePromise = null;

        QUICK_PROMPTS.forEach(function (promptText) {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'ask-yangming-chip';
            chip.textContent = promptText;
            chip.addEventListener('click', function () {
                input.value = promptText;
                openPanel();
                submitCurrentInput();
            });
            quickPrompts.appendChild(chip);
        });

        renderHistory();

        if (sessionStorage.getItem(PANEL_OPEN_KEY) === 'true') {
            openPanel();
        }

        launcher.addEventListener('click', function () {
            if (panel.dataset.state === 'open') {
                closePanel();
            } else {
                openPanel();
            }
        });

        closeButton.addEventListener('click', closePanel);
        resetButton.addEventListener('click', function () {
            history = [];
            saveHistory(history);
            renderHistory();
            setStatus('Conversation cleared.');
        });

        heroTriggers.forEach(function (trigger) {
            trigger.addEventListener('click', function (event) {
                event.preventDefault();
                openPanel();
            });
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            submitCurrentInput();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && panel.dataset.state === 'open') {
                closePanel();
            }
        });

        input.addEventListener('keydown', function (event) {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                submitCurrentInput();
            }
        });

        function loadHistory() {
            try {
                const raw = sessionStorage.getItem(STORAGE_KEY);
                if (!raw) {
                    return [];
                }

                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) {
                    return [];
                }

                return parsed.filter(function (item) {
                    return item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string';
                }).slice(-MAX_HISTORY_ITEMS);
            } catch (error) {
                return [];
            }
        }

        function saveHistory(nextHistory) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory.slice(-MAX_HISTORY_ITEMS)));
        }

        function openPanel() {
            panel.dataset.state = 'open';
            panel.setAttribute('aria-hidden', 'false');
            launcher.setAttribute('aria-expanded', 'true');
            sessionStorage.setItem(PANEL_OPEN_KEY, 'true');
            window.setTimeout(function () {
                input.focus();
                scrollMessagesToBottom();
            }, 80);
        }

        function closePanel() {
            panel.dataset.state = 'closed';
            panel.setAttribute('aria-hidden', 'true');
            launcher.setAttribute('aria-expanded', 'false');
            sessionStorage.setItem(PANEL_OPEN_KEY, 'false');
        }

        function setStatus(message) {
            status.textContent = message || '';
        }

        function scrollMessagesToBottom() {
            messages.scrollTop = messages.scrollHeight;
        }

        function createMessageNode(entry) {
            const wrapper = document.createElement('div');
            wrapper.className = 'ask-yangming-message';
            wrapper.dataset.role = entry.role;

            const meta = document.createElement('div');
            meta.className = 'ask-yangming-meta';
            meta.textContent = entry.role === 'user' ? 'You' : 'Ask Yangming';

            const bubble = document.createElement('div');
            bubble.className = 'ask-yangming-bubble';
            bubble.textContent = entry.content;

            wrapper.appendChild(meta);
            wrapper.appendChild(bubble);

            if (entry.role === 'assistant' && Array.isArray(entry.sources) && entry.sources.length) {
                const sources = document.createElement('div');
                sources.className = 'ask-yangming-sources';

                entry.sources.forEach(function (source) {
                    if (!source || !source.url || !source.title) {
                        return;
                    }

                    const sourceLink = document.createElement('a');
                    sourceLink.className = 'ask-yangming-source';
                    sourceLink.href = source.url;
                    sourceLink.textContent = source.title;
                    sourceLink.target = source.url.startsWith('http') ? '_blank' : '_self';
                    sourceLink.rel = source.url.startsWith('http') ? 'noopener noreferrer' : '';
                    sources.appendChild(sourceLink);
                });

                if (sources.childNodes.length) {
                    wrapper.appendChild(sources);
                }
            }

            return wrapper;
        }

        function renderHistory() {
            messages.innerHTML = '';

            if (!history.length) {
                const empty = document.createElement('div');
                empty.className = 'ask-yangming-empty';
                empty.textContent = 'Ask about Yangming\'s focus areas, relevant blog posts, or whether a project is a fit. This version can answer directly from local site knowledge, even on a static host.';
                messages.appendChild(empty);
                return;
            }

            history.forEach(function (entry) {
                messages.appendChild(createMessageNode(entry));
            });

            scrollMessagesToBottom();
        }

        function appendMessage(entry) {
            const emptyState = messages.querySelector('.ask-yangming-empty');
            if (emptyState) {
                emptyState.remove();
            }

            messages.appendChild(createMessageNode(entry));
            scrollMessagesToBottom();
        }

        function upsertLoadingMessage(messageText) {
            let loadingNode = messages.querySelector('[data-ask-yangming-loading="true"] .ask-yangming-bubble');

            if (!loadingNode) {
                const wrapper = document.createElement('div');
                wrapper.className = 'ask-yangming-message';
                wrapper.dataset.role = 'assistant';
                wrapper.dataset.askYangmingLoading = 'true';
                wrapper.setAttribute('data-ask-yangming-loading', 'true');

                const meta = document.createElement('div');
                meta.className = 'ask-yangming-meta';
                meta.textContent = 'Ask Yangming';

                loadingNode = document.createElement('div');
                loadingNode.className = 'ask-yangming-bubble';

                wrapper.appendChild(meta);
                wrapper.appendChild(loadingNode);

                const emptyState = messages.querySelector('.ask-yangming-empty');
                if (emptyState) {
                    emptyState.remove();
                }

                messages.appendChild(wrapper);
            }

            loadingNode.textContent = messageText;
            scrollMessagesToBottom();
        }

        function removeLoadingMessage() {
            const loadingWrapper = messages.querySelector('[data-ask-yangming-loading="true"]');
            if (loadingWrapper) {
                loadingWrapper.remove();
            }
        }

        function normalizeApiBase(value) {
            const trimmed = String(value || '').trim();
            if (!trimmed) {
                return '';
            }

            return trimmed.replace(/\/+$/, '');
        }

        function normalizeAssistantMode(value) {
            const normalized = String(value || '').trim().toLowerCase();
            if (normalized === 'live' || normalized === 'auto' || normalized === 'static') {
                return normalized;
            }
            return 'static';
        }

        function getApiEndpoint() {
            return apiBase ? apiBase + API_PATH : API_PATH;
        }

        async function submitCurrentInput() {
            if (isSending) {
                return;
            }

            const message = input.value.trim();
            if (!message) {
                setStatus('Type a question first.');
                return;
            }

            if (message.length > 1200) {
                setStatus('Keep it under 1200 characters so the assistant stays sharp.');
                return;
            }

            openPanel();
            setStatus(assistantMode === 'live' ? 'Contacting the live assistant...' : 'Searching local site knowledge...');
            isSending = true;
            input.disabled = true;
            submitButton.disabled = true;

            const userEntry = {
                role: 'user',
                content: message
            };
            const priorHistory = history.slice(-MAX_HISTORY_ITEMS);

            history.push(userEntry);
            history = history.slice(-MAX_HISTORY_ITEMS);
            appendMessage(userEntry);
            saveHistory(history);

            input.value = '';
            upsertLoadingMessage(assistantMode === 'live' ? 'Thinking through the live answer...' : 'Looking through the site knowledge...');

            try {
                const reply = await resolveAssistantReply(message, priorHistory);
                const assistantEntry = {
                    role: 'assistant',
                    content: reply.content,
                    sources: reply.sources
                };

                history.push(assistantEntry);
                history = history.slice(-MAX_HISTORY_ITEMS);
                saveHistory(history);

                removeLoadingMessage();
                appendMessage(assistantEntry);
                setStatus(reply.status);
            } catch (error) {
                removeLoadingMessage();
                console.error('Ask Yangming request failed:', error);

                const fallbackMessage = buildFailureMessage(error, apiBase, assistantMode);
                const assistantEntry = {
                    role: 'assistant',
                    content: fallbackMessage
                };

                history.push(assistantEntry);
                history = history.slice(-MAX_HISTORY_ITEMS);
                saveHistory(history);
                appendMessage(assistantEntry);
                setStatus('The assistant is unavailable right now.');
            } finally {
                isSending = false;
                input.disabled = false;
                submitButton.disabled = false;
                input.focus();
            }
        }

        async function resolveAssistantReply(message, priorHistory) {
            if (assistantMode === 'static') {
                return getStaticReply(message, priorHistory, false);
            }

            try {
                return await getLiveReply(message, priorHistory);
            } catch (error) {
                if (assistantMode === 'auto') {
                    console.warn('Falling back to local site knowledge:', error);
                    return getStaticReply(message, priorHistory, true);
                }

                throw error;
            }
        }

        async function getLiveReply(message, priorHistory) {
            const response = await fetch(getApiEndpoint(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: priorHistory
                })
            });

            const payload = await response.json().catch(function () {
                return {};
            });

            if (!response.ok) {
                throw new Error(payload.error || ('Request failed with ' + response.status));
            }

            return {
                content: payload.answer || 'I could not find a grounded answer from the current site context.',
                sources: Array.isArray(payload.sources) ? payload.sources : [],
                status: 'Grounded answer ready.'
            };
        }

        async function getStaticReply(message, priorHistory, fromFallback) {
            const knowledge = await loadKnowledge();
            const query = [message]
                .concat(priorHistory.slice(-4).map(function (item) { return item.content; }))
                .join('\n');
            const selectedEntries = selectKnowledgeEntries(knowledge, query);
            const answer = buildStaticAnswer(message, selectedEntries);

            return {
                content: answer,
                sources: selectedEntries.slice(0, 3).map(function (entry) {
                    return {
                        title: entry.title,
                        url: entry.url
                    };
                }),
                status: fromFallback
                    ? 'Live API unavailable, answered from local site knowledge.'
                    : 'Answered from local site knowledge.'
            };
        }

        async function loadKnowledge() {
            if (knowledgePromise) {
                return knowledgePromise;
            }

            knowledgePromise = Promise.resolve(EMBEDDED_KNOWLEDGE);
            return knowledgePromise;
        }

        function tokenize(text) {
            return Array.from(new Set(
                String(text || '')
                    .toLowerCase()
                    .replace(/[^a-z0-9\s/-]/g, ' ')
                    .split(/\s+/)
                    .filter(function (token) {
                        return token && token.length > 1 && !STOP_WORDS.has(token);
                    })
            ));
        }

        function scoreKnowledgeEntry(entry, tokens) {
            const titleTokens = tokenize(entry.title || '');
            const tagTokens = tokenize((entry.tags || []).join(' '));
            const bodyTokens = tokenize(entry.content || '');
            const allText = (entry.title + ' ' + entry.content + ' ' + (entry.tags || []).join(' ')).toLowerCase();
            let score = entry.alwaysInclude ? 4 : 0;

            tokens.forEach(function (token) {
                if (titleTokens.includes(token)) {
                    score += 5;
                }
                if (tagTokens.includes(token)) {
                    score += 4;
                }
                if (bodyTokens.includes(token)) {
                    score += 2;
                }
                if (allText.includes(token)) {
                    score += 1;
                }
            });

            return score;
        }

        function selectKnowledgeEntries(knowledge, query) {
            const queryTokens = tokenize(query);
            const stickyEntries = knowledge.filter(function (entry) {
                return entry.alwaysInclude;
            });

            const rankedEntries = knowledge
                .filter(function (entry) {
                    return !entry.alwaysInclude;
                })
                .map(function (entry) {
                    return {
                        entry: entry,
                        score: scoreKnowledgeEntry(entry, queryTokens)
                    };
                })
                .sort(function (left, right) {
                    return right.score - left.score;
                })
                .slice(0, 5)
                .map(function (item) {
                    return item.entry;
                });

            const selected = [];
            const seen = new Set();

            stickyEntries.concat(rankedEntries).forEach(function (entry) {
                if (seen.has(entry.id)) {
                    return;
                }
                seen.add(entry.id);
                selected.push(entry);
            });

            return selected;
        }

        function buildStaticAnswer(message, selectedEntries) {
            const lower = message.toLowerCase();
            const queryTokens = tokenize(message);
            const profileEntry = findEntry(selectedEntries, 'profile-overview');
            const buildEntry = findEntry(selectedEntries, 'profile-builds-serves-outcomes');
            const contactEntry = findEntry(selectedEntries, 'contact-options');
            const workStyleEntry = findEntry(selectedEntries, 'work-style');
            const articleEntries = uniqueByUrl(selectedEntries.filter(isArticleEntry));

            if (matchesIntent(lower, ['contact', 'email', 'reach', 'linkedin', 'hire', 'work'])) {
                return [
                    'The clearest way to reach Yangming is email at `liym1@hotmail.com`. LinkedIn is also listed as a contact path, and the contact tab includes GitHub, Google Scholar, and a meeting-booking option.',
                    'From the site framing, the most relevant work areas are applied AI systems, LLM workflows, statistical ML, data engineering, data products, and experiment infrastructure.'
                ].join('\n\n');
            }

            if (matchesIntent(lower, ['build', 'focus', 'work on', 'what do you do'])) {
                return [
                    'Yangming\'s site positions him around applied AI systems for real-world workflows.',
                    'The clearest build areas called out are LLM systems, statistical ML, data engineering, data products, and experiment infrastructure.',
                    'The homepage also frames the work around shipped workflows, faster decision loops, and reusable internal tooling for healthcare, finance, and enterprise teams.'
                ].join(' ');
            }

            if (matchesIntent(lower, ['post', 'blog', 'article', 'read', 'recommend', 'mlops', 'llm'])) {
                if (!articleEntries.length) {
                    return 'The site has several strong engineering and AI posts, but I could not narrow down a good subset from the current embedded knowledge set. Try the contact tab if you want a more tailored recommendation.';
                }

                const recommended = articleEntries.slice(0, 3);
                return [
                    'A strong starting set from the site would be:',
                    recommended.map(function (entry) {
                        return entry.title + ' because ' + trimSentence(entry.content);
                    }).join(' '),
                    queryTokens.includes('mlops') || queryTokens.includes('llm')
                        ? 'If you care most about production workflows, start with the MLOps and workflow-oriented pieces first, then branch into more specific engineering guides.'
                        : 'If you want a tighter path after that, follow the sources below in order.'
                ].join('\n\n');
            }

            if (matchesIntent(lower, ['where', 'location', 'based', 'vancouver'])) {
                return 'The site lists Yangming as based in Vancouver, BC, Canada. The contact section is the best place to reach out if location matters for collaboration.';
            }

            if (matchesIntent(lower, ['who is', 'who are you', 'overview', 'about'])) {
                return [
                    profileEntry ? trimSentence(profileEntry.content) : '',
                    workStyleEntry ? trimSentence(workStyleEntry.content) : '',
                    contactEntry ? 'If you want to continue the conversation, the contact section points to email, LinkedIn, GitHub, and meeting booking.' : ''
                ].filter(Boolean).join('\n\n');
            }

            return [
                profileEntry ? trimSentence(profileEntry.content) : 'Yangming\'s site is centered on applied AI systems and practical workflow delivery.',
                buildEntry ? trimSentence(buildEntry.content) : '',
                articleEntries.length ? 'Relevant posts are included in the source links below if you want to go deeper into the engineering side.' : '',
                contactEntry ? 'If your question is really about project fit or collaboration, the contact section is the best next step.' : ''
            ].filter(Boolean).join('\n\n');
        }

        function findEntry(entries, id) {
            return entries.find(function (entry) {
                return entry.id === id;
            });
        }

        function isArticleEntry(entry) {
            return entry && entry.url && entry.url.indexOf('/index.html') !== 0;
        }

        function uniqueByUrl(entries) {
            const seen = new Set();
            const result = [];

            entries.forEach(function (entry) {
                if (!entry || !entry.url || seen.has(entry.url)) {
                    return;
                }
                seen.add(entry.url);
                result.push(entry);
            });

            return result;
        }

        function matchesIntent(lowerMessage, candidates) {
            return candidates.some(function (candidate) {
                return lowerMessage.indexOf(candidate) !== -1;
            });
        }

        function trimSentence(text) {
            return String(text || '').replace(/^\s+|\s+$/g, '');
        }

        function buildFailureMessage(error, configuredApiBase, mode) {
            const raw = (error && error.message ? error.message : '').toLowerCase();

            if (raw.includes('not configured') || raw.includes('missing openai_api_key')) {
                return 'The chat UI is live, but the server-side API key is not configured yet. Add `OPENAI_API_KEY` in your deployment environment and this assistant will start answering.';
            }

            if (raw.includes('not found') || raw.includes('404')) {
                return 'This page is running without the `/api/ask-yangming` backend. The frontend is ready, but the site needs a serverless host such as Vercel or Netlify for live model answers.';
            }

            if (raw.includes('failed to fetch') || raw.includes('networkerror') || raw.includes('load failed')) {
                if (configuredApiBase) {
                    return 'The frontend tried to reach the configured API host, but the request failed before the server returned a response. Recheck the API URL, CORS settings, and whether the serverless deployment is live.';
                }

                return 'The frontend could not reach the assistant backend. If you want live model answers, either configure a separate API host or move the full site to Vercel/Netlify.';
            }

            return 'The assistant hit a temporary issue. Try again in a moment, or use the contact section directly.';
        }
    });
})();
