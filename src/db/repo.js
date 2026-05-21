// 知识库 CRUD 仓库层。挂载到 window.KBRepo
(function (global) {
    const { tx, reqToPromise, STORE_CONVERSATIONS, STORE_MESSAGES, STORE_RECALL_CONVS, STORE_KNOWLEDGE_CARDS, STORE_WORKFLOWS } = global.KBSchema;

    function genId() {
        return 'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    // 32-bit DJB2 hash, base36 编码，足以做去重 key
    function simpleHash(str) {
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h + str.charCodeAt(i)) | 0;
        }
        return (h >>> 0).toString(36);
    }

    // 从对话 URL 或标题派生稳定 ID，使重复保存覆盖而非新建
    function deriveStableId(payload) {
        const url = payload.url || '';
        // DeepSeek 对话路径形如 /a/chat/s/{uuid}
        const m = url.match(/chat\/s\/([A-Za-z0-9-]+)/);
        if (m) return 'ds_' + m[1];
        if (url) return 'u_' + simpleHash(url);
        if (payload.title) return 't_' + simpleHash(payload.title);
        return genId();
    }

    function buildPreview(messages) {
        const firstUser = messages.find((m) => m.role === 'user');
        if (!firstUser) return '';
        const text = (firstUser.content || '').replace(/\s+/g, ' ').trim();
        return text.length > 120 ? text.slice(0, 120) + '...' : text;
    }

    async function saveConversation(payload) {
        const id = payload.id || deriveStableId(payload);
        const savedAt = Date.now();

        // 若已存在同 id 记录，沿用其 createdAt（首次入库时间）
        const existing = await getConversation(id).catch(() => null);
        const newMsgCount = (payload.messages || []).length;

        // 已存在且消息数相同 → 跳过保存（从 messages 表数实际条数，避免旧记录无 messageCount 字段）
        if (existing) {
            const oldMsgs = await getMessages(id).catch(() => []);
            if (oldMsgs.length === newMsgCount) {
                return { id, saved: false };
            }
        }

        const createdAt = (existing && existing.createdAt) || payload.createdAt || savedAt;

        const conv = {
            id,
            title: payload.title || 'Untitled',
            url: payload.url || '',
            savedAt,
            createdAt,
            messageCount: (payload.messages || []).length,
            preview: buildPreview(payload.messages || []),
            // 摘要字段：若已存在则保留，覆盖式重存时不丢历史摘要
            summary: (existing && existing.summary) || '',
            tags: (existing && existing.tags) || [],
            summaryStatus: (existing && existing.summaryStatus) || 'idle', // idle | pending | ready | failed
            summaryError: (existing && existing.summaryError) || '',
            summaryUpdatedAt: (existing && existing.summaryUpdatedAt) || 0,
        };

        const transaction = await tx([STORE_CONVERSATIONS, STORE_MESSAGES], 'readwrite');
        const convStore = transaction.objectStore(STORE_CONVERSATIONS);
        const msgStore = transaction.objectStore(STORE_MESSAGES);

        // 覆盖式保存：先删旧消息（如果是同 id 重复保存）
        const idx = msgStore.index('conversationId');
        await new Promise((resolve, reject) => {
            const cursorReq = idx.openCursor(IDBKeyRange.only(id));
            cursorReq.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            cursorReq.onerror = () => reject(cursorReq.error);
        });

        convStore.put(conv);
        (payload.messages || []).forEach((m, i) => {
            msgStore.put({
                conversationId: id,
                idx: typeof m.idx === 'number' ? m.idx : i,
                role: m.role,
                content: m.content || '',
                thinking: m.thinking || '',
                thinkingHint: m.thinkingHint || '',
            });
        });

        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });

        return { id, saved: true };
    }

    async function listConversations() {
        const transaction = await tx([STORE_CONVERSATIONS], 'readonly');
        const store = transaction.objectStore(STORE_CONVERSATIONS);
        const all = await reqToPromise(store.getAll());
        return all.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    }

    async function getConversation(id) {
        const transaction = await tx([STORE_CONVERSATIONS], 'readonly');
        const store = transaction.objectStore(STORE_CONVERSATIONS);
        return reqToPromise(store.get(id));
    }

    async function getMessages(conversationId) {
        const transaction = await tx([STORE_MESSAGES], 'readonly');
        const store = transaction.objectStore(STORE_MESSAGES);
        const idx = store.index('conv_idx');
        const range = IDBKeyRange.bound([conversationId, -Infinity], [conversationId, Infinity]);
        const all = await reqToPromise(idx.getAll(range));
        return all.sort((a, b) => a.idx - b.idx);
    }

    async function updateSummary(id, patch) {
        const transaction = await tx([STORE_CONVERSATIONS], 'readwrite');
        const store = transaction.objectStore(STORE_CONVERSATIONS);
        const cur = await reqToPromise(store.get(id));
        if (!cur) return false;
        if (patch.summary !== undefined) cur.summary = patch.summary;
        if (patch.tags !== undefined) cur.tags = patch.tags;
        if (patch.summaryStatus !== undefined) cur.summaryStatus = patch.summaryStatus;
        if (patch.summaryError !== undefined) cur.summaryError = patch.summaryError;
        cur.summaryUpdatedAt = Date.now();
        store.put(cur);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
        return true;
    }

    async function deleteConversation(id) {
        const transaction = await tx([STORE_CONVERSATIONS, STORE_MESSAGES], 'readwrite');
        transaction.objectStore(STORE_CONVERSATIONS).delete(id);
        const msgStore = transaction.objectStore(STORE_MESSAGES);
        const idx = msgStore.index('conversationId');
        await new Promise((resolve, reject) => {
            const cursorReq = idx.openCursor(IDBKeyRange.only(id));
            cursorReq.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            cursorReq.onerror = () => reject(cursorReq.error);
        });
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // ---- 搜索 ----
    function makeSnippet(text, qLower, around) {
        if (!text) return '';
        const lower = text.toLowerCase();
        const i = lower.indexOf(qLower);
        if (i < 0) return '';
        const start = Math.max(0, i - around);
        const end = Math.min(text.length, i + qLower.length + around);
        const head = start > 0 ? '…' : '';
        const tail = end < text.length ? '…' : '';
        return head + text.slice(start, end).replace(/\s+/g, ' ').trim() + tail;
    }

    async function searchAll(query) {
        const q = (query || '').trim();
        if (!q) {
            const list = await listConversations();
            return list.map((c) => ({ conv: c, titleHit: false, previewHit: false, msgHits: 0, snippet: '' }));
        }
        const qLower = q.toLowerCase();

        const transaction = await tx([STORE_CONVERSATIONS, STORE_MESSAGES], 'readonly');
        const convStore = transaction.objectStore(STORE_CONVERSATIONS);
        const msgStore = transaction.objectStore(STORE_MESSAGES);
        const [convs, msgs] = await Promise.all([
            reqToPromise(convStore.getAll()),
            reqToPromise(msgStore.getAll()),
        ]);

        const msgByConv = new Map();
        for (const m of msgs) {
            const arr = msgByConv.get(m.conversationId) || [];
            arr.push(m);
            msgByConv.set(m.conversationId, arr);
        }

        const results = [];
        for (const c of convs) {
            const titleHit = (c.title || '').toLowerCase().includes(qLower);
            const previewHit = (c.preview || '').toLowerCase().includes(qLower);
            const summaryHit = (c.summary || '').toLowerCase().includes(qLower);
            const tagsHit = Array.isArray(c.tags) && c.tags.some((tg) => String(tg).toLowerCase().includes(qLower));
            let msgHits = 0;
            let snippet = '';
            const list = (msgByConv.get(c.id) || []).sort((a, b) => a.idx - b.idx);
            for (const m of list) {
                const inContent = (m.content || '').toLowerCase().includes(qLower);
                const inThinking = (m.thinking || '').toLowerCase().includes(qLower);
                if (inContent || inThinking) {
                    msgHits++;
                    if (!snippet) {
                        snippet = makeSnippet(inContent ? m.content : m.thinking, qLower, 30);
                    }
                }
            }
            if (titleHit || previewHit || summaryHit || tagsHit || msgHits > 0) {
                if (!snippet) {
                    if (summaryHit) snippet = makeSnippet(c.summary, qLower, 30);
                    else if (previewHit) snippet = makeSnippet(c.preview, qLower, 30);
                    else if (titleHit) snippet = c.title;
                }
                results.push({ conv: c, titleHit, previewHit, summaryHit, tagsHit, msgHits, snippet });
            }
        }
        results.sort((a, b) => (b.conv.savedAt || 0) - (a.conv.savedAt || 0));
        return results;
    }

    // ---- Recall 对话 CRUD ----
    function genRecallId() {
        return 'rc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    async function saveRecallConv(data) {
        const now = Date.now();
        const id = data.id || genRecallId();
        const existing = await getRecallConv(id).catch(() => null);
        const record = {
            id,
            title: data.title || (existing && existing.title) || 'New Chat',
            messages: data.messages || [],
            createdAt: (existing && existing.createdAt) || now,
            updatedAt: now,
        };
        const transaction = await tx([STORE_RECALL_CONVS], 'readwrite');
        transaction.objectStore(STORE_RECALL_CONVS).put(record);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
        return { id };
    }

    async function listRecallConvs() {
        const transaction = await tx([STORE_RECALL_CONVS], 'readonly');
        const store = transaction.objectStore(STORE_RECALL_CONVS);
        const all = await reqToPromise(store.getAll());
        return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }

    async function getRecallConv(id) {
        const transaction = await tx([STORE_RECALL_CONVS], 'readonly');
        return reqToPromise(transaction.objectStore(STORE_RECALL_CONVS).get(id));
    }

    async function deleteRecallConv(id) {
        const transaction = await tx([STORE_RECALL_CONVS], 'readwrite');
        transaction.objectStore(STORE_RECALL_CONVS).delete(id);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // ---- 知识卡片 CRUD ----
    function genCardId() {
        return 'kc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    async function saveKnowledgeCard(data) {
        const now = Date.now();
        const id = data.id || genCardId();
        const existing = await getKnowledgeCard(id).catch(() => null);
        const record = {
            id,
            title: data.title || (existing && existing.title) || '',
            article: data.article !== undefined ? data.article : (existing && existing.article) || '',
            summary: data.summary !== undefined ? data.summary : (existing && existing.summary) || '',
            tags: data.tags !== undefined ? data.tags : (existing && existing.tags) || [],
            sourceIds: data.sourceIds !== undefined ? data.sourceIds : (existing && existing.sourceIds) || [],
            sourceTitles: data.sourceTitles !== undefined ? data.sourceTitles : (existing && existing.sourceTitles) || [],
            status: data.status !== undefined ? data.status : (existing && existing.status) || 'pending',
            errorKind: data.errorKind !== undefined ? data.errorKind : (existing && existing.errorKind) || '',
            createdAt: (existing && existing.createdAt) || data.createdAt || now,
            updatedAt: now,
        };
        const transaction = await tx([STORE_KNOWLEDGE_CARDS], 'readwrite');
        transaction.objectStore(STORE_KNOWLEDGE_CARDS).put(record);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
        return { id };
    }

    async function listKnowledgeCards() {
        const transaction = await tx([STORE_KNOWLEDGE_CARDS], 'readonly');
        const store = transaction.objectStore(STORE_KNOWLEDGE_CARDS);
        const all = await reqToPromise(store.getAll());
        return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }

    async function getKnowledgeCard(id) {
        const transaction = await tx([STORE_KNOWLEDGE_CARDS], 'readonly');
        return reqToPromise(transaction.objectStore(STORE_KNOWLEDGE_CARDS).get(id));
    }

    async function updateKnowledgeCard(id, patch) {
        const transaction = await tx([STORE_KNOWLEDGE_CARDS], 'readwrite');
        const store = transaction.objectStore(STORE_KNOWLEDGE_CARDS);
        const cur = await reqToPromise(store.get(id));
        if (!cur) return false;
        if (patch.title !== undefined) cur.title = patch.title;
        if (patch.article !== undefined) cur.article = patch.article;
        if (patch.summary !== undefined) cur.summary = patch.summary;
        if (patch.tags !== undefined) cur.tags = patch.tags;
        if (patch.sourceIds !== undefined) cur.sourceIds = patch.sourceIds;
        if (patch.sourceTitles !== undefined) cur.sourceTitles = patch.sourceTitles;
        if (patch.status !== undefined) cur.status = patch.status;
        if (patch.errorKind !== undefined) cur.errorKind = patch.errorKind;
        cur.updatedAt = Date.now();
        store.put(cur);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
        return true;
    }

    async function deleteKnowledgeCard(id) {
        const transaction = await tx([STORE_KNOWLEDGE_CARDS], 'readwrite');
        transaction.objectStore(STORE_KNOWLEDGE_CARDS).delete(id);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // ---- 工作流 CRUD ----
    function genWorkflowId() {
        return 'wf_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    async function saveWorkflow(data) {
        const now = Date.now();
        const id = data.id || genWorkflowId();
        const existing = await getWorkflow(id).catch(() => null);
        const record = {
            id,
            title: data.title || (existing && existing.title) || '',
            article: data.article !== undefined ? data.article : (existing && existing.article) || '',
            summary: data.summary !== undefined ? data.summary : (existing && existing.summary) || '',
            tags: data.tags !== undefined ? data.tags : (existing && existing.tags) || [],
            sourceIds: data.sourceIds !== undefined ? data.sourceIds : (existing && existing.sourceIds) || [],
            sourceTitles: data.sourceTitles !== undefined ? data.sourceTitles : (existing && existing.sourceTitles) || [],
            status: data.status !== undefined ? data.status : (existing && existing.status) || 'pending',
            errorKind: data.errorKind !== undefined ? data.errorKind : (existing && existing.errorKind) || '',
            createdAt: (existing && existing.createdAt) || data.createdAt || now,
            updatedAt: now,
        };
        const transaction = await tx([STORE_WORKFLOWS], 'readwrite');
        transaction.objectStore(STORE_WORKFLOWS).put(record);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
        return { id };
    }

    async function listWorkflows() {
        const transaction = await tx([STORE_WORKFLOWS], 'readonly');
        const store = transaction.objectStore(STORE_WORKFLOWS);
        const all = await reqToPromise(store.getAll());
        return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }

    async function getWorkflow(id) {
        const transaction = await tx([STORE_WORKFLOWS], 'readonly');
        return reqToPromise(transaction.objectStore(STORE_WORKFLOWS).get(id));
    }

    async function updateWorkflow(id, patch) {
        const transaction = await tx([STORE_WORKFLOWS], 'readwrite');
        const store = transaction.objectStore(STORE_WORKFLOWS);
        const cur = await reqToPromise(store.get(id));
        if (!cur) return false;
        if (patch.title !== undefined) cur.title = patch.title;
        if (patch.article !== undefined) cur.article = patch.article;
        if (patch.summary !== undefined) cur.summary = patch.summary;
        if (patch.tags !== undefined) cur.tags = patch.tags;
        if (patch.sourceIds !== undefined) cur.sourceIds = patch.sourceIds;
        if (patch.sourceTitles !== undefined) cur.sourceTitles = patch.sourceTitles;
        if (patch.status !== undefined) cur.status = patch.status;
        if (patch.errorKind !== undefined) cur.errorKind = patch.errorKind;
        cur.updatedAt = Date.now();
        store.put(cur);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
        return true;
    }

    async function deleteWorkflow(id) {
        const transaction = await tx([STORE_WORKFLOWS], 'readwrite');
        transaction.objectStore(STORE_WORKFLOWS).delete(id);
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // 构建召回上下文：摘要优先，降级到标题+预览
    async function buildRecallContext(maxChars) {
        const convs = await listConversations();
        const entries = [];
        let totalLen = 0;

        const sorted = convs.slice().sort((a, b) => {
            const aReady = (a.summaryStatus === 'ready' && a.summary) ? 0 : 1;
            const bReady = (b.summaryStatus === 'ready' && b.summary) ? 0 : 1;
            if (aReady !== bReady) return aReady - bReady;
            return (b.savedAt || 0) - (a.savedAt || 0);
        });

        const convMap = new Map();

        for (const c of sorted) {
            let entry;
            const urlPart = c.url ? '\nURL: ' + c.url : '';
            if (c.summaryStatus === 'ready' && c.summary) {
                const tags = Array.isArray(c.tags) && c.tags.length
                    ? ' [tags: ' + c.tags.join(', ') + ']'
                    : '';
                entry = '[ID:' + c.id + '] ' + (c.title || 'Untitled') + tags + '\nSummary: ' + c.summary + urlPart;
            } else {
                entry = '[ID:' + c.id + '] ' + (c.title || 'Untitled')
                    + (c.preview ? '\nPreview: ' + c.preview : '') + urlPart;
            }

            if (totalLen + entry.length + 2 > maxChars) break;
            entries.push(entry);
            totalLen += entry.length + 2;
            convMap.set(c.id, { id: c.id, title: c.title || 'Untitled', url: c.url || '' });
        }

        return { context: entries.join('\n\n'), convMap };
    }

    global.KBRepo = {
        saveConversation,
        listConversations,
        getConversation,
        getMessages,
        deleteConversation,
        searchAll,
        updateSummary,
        buildRecallContext,
        saveRecallConv,
        listRecallConvs,
        getRecallConv,
        deleteRecallConv,
        saveKnowledgeCard,
        listKnowledgeCards,
        getKnowledgeCard,
        updateKnowledgeCard,
        deleteKnowledgeCard,
        saveWorkflow,
        listWorkflows,
        getWorkflow,
        updateWorkflow,
        deleteWorkflow,
    };
})(typeof window !== 'undefined' ? window : self);
