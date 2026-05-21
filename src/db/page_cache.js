// 读取 DeepSeek 页面侧的 IndexedDB 缓存（库名: deepseek-chat, 对象库: history-message）
// 与扩展自身的 KB（deepseek2markdown_kb）完全隔离，仅做只读访问，挂到 window.PageCache。
(function (global) {
    const PAGE_DB = 'deepseek-chat';
    const PAGE_STORE = 'history-message';
    const SESSION_ID_RE = /chat\/s\/([A-Za-z0-9-]+)/;

    function getSessionIdFromUrl(url) {
        if (!url) return null;
        const m = String(url).match(SESSION_ID_RE);
        return m ? m[1] : null;
    }

    // 不指定 version，避免触发 onupgradeneeded 误升页面 DB
    function openPageDB() {
        return new Promise((resolve) => {
            let aborted = false;
            let req;
            try {
                req = indexedDB.open(PAGE_DB);
            } catch (_) {
                resolve(null);
                return;
            }
            req.onupgradeneeded = () => {
                // 库本不存在；放弃，不创建任何 store
                aborted = true;
                try { req.transaction && req.transaction.abort(); } catch (_) { /* ignore */ }
            };
            req.onsuccess = () => {
                const db = req.result;
                if (aborted || !db.objectStoreNames.contains(PAGE_STORE)) {
                    try { db.close(); } catch (_) { /* ignore */ }
                    resolve(null);
                    return;
                }
                resolve(db);
            };
            req.onerror = () => resolve(null);
            req.onblocked = () => resolve(null);
        });
    }

    async function loadCachedConversation(sessionId) {
        if (!sessionId) return null;
        const db = await openPageDB();
        if (!db) return null;
        return new Promise((resolve) => {
            let tx;
            try {
                tx = db.transaction(PAGE_STORE, 'readonly');
            } catch (_) {
                try { db.close(); } catch (_) { /* ignore */ }
                resolve(null);
                return;
            }
            const store = tx.objectStore(PAGE_STORE);
            const r = store.get(sessionId);
            r.onsuccess = () => {
                const rec = r.result;
                try { db.close(); } catch (_) { /* ignore */ }
                if (!rec) { resolve(null); return; }
                // 真实结构：记录顶层可能就是 { data: { chat_messages, chat_session, ... }, ... }
                // 也兼容直接把字段铺平的情况
                const data = rec.data || rec;
                const chat_messages = data.chat_messages || rec.chat_messages || [];
                const chat_session = data.chat_session || rec.chat_session || {};
                resolve({
                    sessionId,
                    title: chat_session.title || '',
                    chat_messages,
                });
            };
            r.onerror = () => {
                try { db.close(); } catch (_) { /* ignore */ }
                resolve(null);
            };
        });
    }

    // ----- fragment -> Markdown -----
    function trimStr(s) { return (s == null ? '' : String(s)).trim(); }

    // 去除引用占位符，如 [citation:1][citation:8]
    function stripCitations(s) {
        if (typeof s !== 'string') return s;
        return s.replace(/\[citation:\s*\d+\s*\]/g, '');
    }

    function renderSearchFragment(fragment) {
        let out = '';
        const queries = Array.isArray(fragment.queries) ? fragment.queries : [];
        const results = Array.isArray(fragment.results) ? fragment.results : [];
        if (queries.length) {
            const qs = queries
                .map((q) => (typeof q === 'string' ? q : (q && q.query) || ''))
                .filter(Boolean);
            if (qs.length) out += `**搜索：** ${qs.join(' / ')}\n\n`;
        }
        if (results.length) {
            results.forEach((r) => {
                const title = trimStr(r.title) || trimStr(r.site_name) || '链接';
                const url = trimStr(r.url);
                const snippet = trimStr(r.snippet);
                if (url) {
                    out += `> [${title}](${url})${snippet ? ' — ' + snippet : ''}\n`;
                } else if (snippet) {
                    out += `> ${title} — ${snippet}\n`;
                }
            });
            if (out && !out.endsWith('\n\n')) out += '\n';
        }
        return out;
    }

    // 思考链 fragment 的 type 名在不同版本里可能是 THINK / THOUGHT / REASONING 等；
    // 用启发式：含 thinking 文本字段或 type 命中关键字
    function isThinkingFragment(fragment) {
        const t = String(fragment && fragment.type || '').toUpperCase();
        if (t.includes('THINK') || t.includes('THOUGHT') || t.includes('REASON')) return true;
        if (typeof fragment.thinking_content === 'string' && fragment.thinking_content) return true;
        return false;
    }

    function getThinkingText(fragment) {
        return fragment.thinking_content || fragment.thinking || fragment.reasoning || '';
    }

    function isSearchFragment(fragment) {
        return (Array.isArray(fragment.queries) && fragment.queries.length) ||
               (Array.isArray(fragment.results) && fragment.results.length);
    }

    function fragmentToMarkdown(fragment, opts) {
        if (!fragment) return '';
        opts = opts || {};
        // 暂不导出联网搜索片段
        // if (isSearchFragment(fragment)) {
        //     return renderSearchFragment(fragment);
        // }
        if (isThinkingFragment(fragment)) {
            if (!opts.isExportChainOfThought) return '';
            const text = trimStr(getThinkingText(fragment));
            if (!text) return '';
            const quoted = text.split(/\r?\n/).map((ln) => ln.trim() ? `> ${ln}` : '> ').join('\n');
            return quoted + '\n\n';
        }
        // 普通文本/Markdown 内容
        if (typeof fragment.content === 'string') {
            return fragment.content;
        }
        return '';
    }

    function isBusyServerAnswer(text) {
        return typeof text === 'string' && text.includes('服务器繁忙，请稍后再试。');
    }

    function buildAssistantParts(message, opts) {
        const fragments = Array.isArray(message.fragments) ? message.fragments : [];
        let thinkingMd = '';
        let searchMd = '';
        let contentMd = '';
        for (const f of fragments) {
            if (!f) continue;
            // 暂不导出联网搜索片段
            // if (isSearchFragment(f)) {
            //     searchMd += renderSearchFragment(f);
            // } else
            if (isSearchFragment(f)) {
                // 跳过搜索片段
            } else if (isThinkingFragment(f)) {
                if (opts.isExportChainOfThought) {
                    const md = fragmentToMarkdown(f, opts);
                    if (md) thinkingMd += md;
                }
            } else if (typeof f.content === 'string' && f.content) {
                contentMd += f.content;
            }
        }
        return { thinkingMd: trimStr(thinkingMd), searchMd: trimStr(searchMd), contentMd: trimStr(stripCitations(contentMd)) };
    }

    function buildUserContent(message) {
        const fragments = Array.isArray(message.fragments) ? message.fragments : [];
        let s = '';
        for (const f of fragments) {
            if (f && typeof f.content === 'string') s += f.content;
        }
        return trimStr(stripCitations(s));
    }

    // 按 message_id 升序排（旧→新）；message_id 缺失的退化用原下标稳定排序
    function sortChatMessagesByMessageId(list) {
        return list
            .map((m, i) => ({ m, i, mid: typeof m.message_id === 'number' ? m.message_id : Number(m.message_id) }))
            .sort((a, b) => {
                const ax = Number.isFinite(a.mid) ? a.mid : Number.POSITIVE_INFINITY;
                const bx = Number.isFinite(b.mid) ? b.mid : Number.POSITIVE_INFINITY;
                if (ax !== bx) return ax - bx;
                return a.i - b.i;
            })
            .map((x) => x.m);
    }

    // 与 content.js getOrderedMessages 同形态：返回字符串数组
    function cachedToOrderedMessages(cached, config) {
        if (!cached || !Array.isArray(cached.chat_messages)) return [];
        const opts = {
            isExportChainOfThought: !!(config && config.isExportChainOfThought),
            isExportBusyServerMessages: !!(config && config.isExportBusyServerMessages),
        };
        const out = [];
        const list = sortChatMessagesByMessageId(cached.chat_messages);
        for (let i = 0; i < list.length; i++) {
            const m = list[i];
            const role = String(m.role || '').toUpperCase();
            if (role === 'USER') {
                const content = buildUserContent(m);
                // 与 DOM 侧一致：若紧随其后的 assistant 是繁忙消息，则跳过该用户消息
                const next = list[i + 1];
                if (next && String(next.role || '').toUpperCase() === 'ASSISTANT') {
                    const parts = buildAssistantParts(next, opts);
                    if (isBusyServerAnswer(parts.contentMd) && !opts.isExportBusyServerMessages) {
                        continue;
                    }
                }
                if (content) out.push(`# 用户：\n\n${content}`);
            } else if (role === 'ASSISTANT') {
                const parts = buildAssistantParts(m, opts);
                if (isBusyServerAnswer(parts.contentMd) && !opts.isExportBusyServerMessages) continue;
                if (!parts.contentMd) continue;
                let head = '';
                if (parts.thinkingMd) head += parts.thinkingMd + '\n';
                if (parts.searchMd) head += parts.searchMd + '\n';
                const block = `# DeepSeek：\n${head}\n**原始回答**\n\n${parts.contentMd}\n\n`.trim();
                out.push(block);
            }
        }
        return out;
    }

    // 与 content.js getStructuredMessages 同形态：{idx, role, content, thinking, thinkingHint}
    function cachedToStructuredMessages(cached, config) {
        if (!cached || !Array.isArray(cached.chat_messages)) return [];
        const opts = {
            isExportChainOfThought: true, // 结构化入库尽量保留思考链原文
            isExportBusyServerMessages: !!(config && config.isExportBusyServerMessages),
        };
        const out = [];
        let idx = 0;
        const list = sortChatMessagesByMessageId(cached.chat_messages);
        for (let i = 0; i < list.length; i++) {
            const m = list[i];
            const role = String(m.role || '').toUpperCase();
            if (role === 'USER') {
                const content = buildUserContent(m);
                if (!content) continue;
                out.push({ idx: idx++, role: 'user', content, thinking: '', thinkingHint: '' });
            } else if (role === 'ASSISTANT') {
                const parts = buildAssistantParts(m, opts);
                if (isBusyServerAnswer(parts.contentMd) && !opts.isExportBusyServerMessages) continue;
                if (!parts.contentMd) continue;
                out.push({
                    idx: idx++,
                    role: 'assistant',
                    content: parts.contentMd,
                    thinking: parts.thinkingMd,
                    thinkingHint: parts.searchMd ? '已联网搜索' : '',
                });
            }
        }
        return out;
    }

    global.PageCache = {
        getSessionIdFromUrl,
        loadCachedConversation,
        fragmentToMarkdown,
        cachedToOrderedMessages,
        cachedToStructuredMessages,
    };
})(typeof window !== 'undefined' ? window : self);
