// DeepSeek API 客户端（OpenAI-compatible /v1/chat/completions）。挂载到 window.KBDeepSeek
(function (global) {
    const ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

    // 标准化错误：{kind, message, status?}
    // kind: no_key | auth | balance | ratelimit | server | network | parse | unknown
    function makeErr(kind, message, status) {
        const e = new Error(message || kind);
        e.kind = kind;
        if (typeof status === 'number') e.status = status;
        return e;
    }

    function classifyHttp(status, bodyText) {
        const lower = (bodyText || '').toLowerCase();
        if (status === 401 || status === 403) return 'auth';
        if (status === 402 || lower.includes('insufficient') || lower.includes('balance')) return 'balance';
        if (status === 429) return 'ratelimit';
        if (status >= 500) return 'server';
        return 'unknown';
    }

    async function callChat(payload, opts) {
        opts = opts || {};
        const apiKey = opts.apiKey;
        if (!apiKey) throw makeErr('no_key', 'API Key not configured');

        let resp;
        try {
            resp = await fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey,
                },
                body: JSON.stringify(payload),
                signal: opts.signal,
            });
        } catch (err) {
            throw makeErr('network', String(err && err.message || err));
        }

        if (!resp.ok) {
            const body = await resp.text().catch(() => '');
            throw makeErr(classifyHttp(resp.status, body), body || ('HTTP ' + resp.status), resp.status);
        }

        let json;
        try {
            json = await resp.json();
        } catch (err) {
            throw makeErr('parse', 'Invalid JSON response');
        }
        return json;
    }

    function extractContent(resp) {
        try {
            return resp.choices[0].message.content || '';
        } catch (_) {
            return '';
        }
    }

    function extractUsage(resp) {
        return (resp && resp.usage) || null;
    }

    // 摘要：返回 { summary, tags, usage }
    async function summarize(text, opts) {
        const payload = global.KBPrompts.buildSummarizePayload(text, opts && opts.model);
        const resp = await callChat(payload, opts);
        const raw = extractContent(resp).trim();
        let parsed;
        try {
            // 容错：若返回带 ```json ... ```
            const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
            parsed = JSON.parse(stripped);
        } catch (_) {
            throw makeErr('parse', 'Summary JSON parse failed: ' + raw.slice(0, 120));
        }
        const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
        const tags = Array.isArray(parsed.tags) ? parsed.tags.map((x) => String(x).trim()).filter(Boolean).slice(0, 6) : [];
        if (!summary) throw makeErr('parse', 'Summary missing in response');
        return { summary, tags, usage: extractUsage(resp) };
    }

    // 极轻量连通性测试：1 token 输出
    async function testConnection(opts) {
        const payload = {
            model: (opts && opts.model) || 'deepseek-chat',
            messages: [
                { role: 'user', content: 'ping' },
            ],
            max_tokens: 1,
            stream: false,
        };
        await callChat(payload, opts);
        return true;
    }

    // 流式调用：AsyncGenerator，逐块 yield 文本，最后 yield { usage }
    async function* recallStream(payload, opts) {
        opts = opts || {};
        const apiKey = opts.apiKey;
        if (!apiKey) throw makeErr('no_key', 'API Key not configured');

        let resp;
        try {
            resp = await fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey,
                },
                body: JSON.stringify(payload),
                signal: opts.signal,
            });
        } catch (err) {
            if (err.name === 'AbortError') return;
            throw makeErr('network', String(err && err.message || err));
        }

        if (!resp.ok) {
            const body = await resp.text().catch(() => '');
            throw makeErr(classifyHttp(resp.status, body), body || ('HTTP ' + resp.status), resp.status);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let usage = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop(); // 保留不完整行

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;
                const data = trimmed.slice(5).trim();
                if (data === '[DONE]') {
                    if (usage) yield { usage };
                    return;
                }
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.usage) usage = parsed.usage;
                    const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
                    if (delta && delta.content) {
                        yield delta.content;
                    }
                } catch (_) { /* 跳过格式错误的 chunk */ }
            }
        }

        if (usage) yield { usage };
    }

    // 标题生成：返回 { title, usage }
    async function generateTitle(question, opts) {
        const payload = global.KBPrompts.buildTitlePayload(question, opts && opts.model);
        const resp = await callChat(payload, opts);
        const raw = extractContent(resp).trim();
        let parsed;
        try {
            const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
            parsed = JSON.parse(stripped);
        } catch (_) {
            throw makeErr('parse', 'Title JSON parse failed: ' + raw.slice(0, 80));
        }
        const title = typeof parsed.title === 'string' ? parsed.title.trim().slice(0, 30) : '';
        return { title: title || 'New Chat', usage: extractUsage(resp) };
    }

    // 知识沉淀：多篇对话合成知识文章，返回 { title, article, summary, tags, usage }
    async function distill(conversationTexts, opts) {
        const payload = global.KBPrompts.buildDistillPayload(conversationTexts, opts && opts.model);
        const resp = await callChat(payload, opts);
        const raw = extractContent(resp).trim();
        let parsed;
        try {
            const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
            parsed = JSON.parse(stripped);
        } catch (_) {
            throw makeErr('parse', 'Distill JSON parse failed: ' + raw.slice(0, 120));
        }
        const title = typeof parsed.title === 'string' ? parsed.title.trim().slice(0, 30) : '';
        const article = typeof parsed.article === 'string' ? parsed.article.trim() : '';
        const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
        const tags = Array.isArray(parsed.tags) ? parsed.tags.map((x) => String(x).trim()).filter(Boolean).slice(0, 6) : [];
        if (!article) throw makeErr('parse', 'Article missing in distill response');
        return { title: title || 'Knowledge Card', article, summary, tags, usage: extractUsage(resp) };
    }

    // 工作流提取：从多篇对话中提取可复用工作流，返回 { title, article, summary, tags, usage }
    async function extractWorkflow(conversationTexts, opts) {
        const payload = global.KBPrompts.buildWorkflowPayload(conversationTexts, opts && opts.model);
        const resp = await callChat(payload, opts);
        const raw = extractContent(resp).trim();
        let parsed;
        try {
            const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
            parsed = JSON.parse(stripped);
        } catch (_) {
            throw makeErr('parse', 'Workflow JSON parse failed: ' + raw.slice(0, 120));
        }
        const title = typeof parsed.title === 'string' ? parsed.title.trim().slice(0, 30) : '';
        const article = typeof parsed.article === 'string' ? parsed.article.trim() : '';
        const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
        const tags = Array.isArray(parsed.tags) ? parsed.tags.map((x) => String(x).trim()).filter(Boolean).slice(0, 6) : [];
        if (!article) throw makeErr('parse', 'Article missing in workflow response');
        return { title: title || 'Workflow', article, summary, tags, usage: extractUsage(resp) };
    }

    global.KBDeepSeek = { summarize, testConnection, recallStream, generateTitle, distill, extractWorkflow };
})(typeof window !== 'undefined' ? window : self);
