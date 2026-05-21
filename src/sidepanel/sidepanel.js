// Side Panel 主逻辑
(function () {
    const i18n = {
        zh: {
            title: '📚 知识库',
            emptyTitle: '还没有任何对话',
            emptyTip: '在 DeepSeek 对话页打开本插件，点击「将当前对话加入知识库」即可保存。',
            placeholder: '从左侧选择一个对话查看',
            user: '用户',
            assistant: 'DeepSeek',
            thinking: '💭 思维链',
            thinkingHint: '思考摘要',
            metaSaved: '保存于',
            metaCount: '条消息',
            origin: '↗ 原对话',
            del: '🗑️ 删除',
            confirmDel: '确认删除该对话？此操作不可撤销。',
            justNow: '刚刚',
            minutesAgo: '分钟前',
            hoursAgo: '小时前',
            daysAgo: '天前',
            searchPlaceholder: '搜索标题/正文/思考链...',
            noResult: '没有匹配的对话',
            hits: '处命中',
            summaryReady: '✨ AI 摘要',
            summaryPending: '⏳ 摘要生成中…',
            summaryFailed: '⚠️ 摘要失败',
            summaryIdle: '尚未生成摘要',
            retrySummary: '✨ 重新摘要',
            generateSummary: '✨ 生成摘要',
            tbSave: '保存当前对话',
            tbSaveOk: '已保存',
            tbSaveNoChange: '知识库无变化',
            tbSaveExists: '已更新（覆盖原记录）',
            tbSaveFail: '保存失败',
            tbSaveExtractFail: '抽取失败，请刷新页面后重试',
            tbSaveNotOnDS: '请在 DeepSeek 对话页使用',
            tbSaveNotOnDSHint: '如果你已经在对话页，请点击',
            refresh: '刷新',
            tbSaveEmpty: '未找到对话内容',
            tabKB: '📚 知识库',
            tabRecall: '🧠 AI回忆',
            recallWelcomeTitle: 'AI 回忆',
            recallWelcomeDesc: '用自然语言搜索你的知识库，我会帮你找到相关对话。',
            recallPlaceholder: '输入你的问题...',
            recallThinking: '正在思考...',
            recallNoResult: '没有找到相关对话',
            recallNoKey: '请先在设置中配置 API Key',
            recallEmptyKB: '知识库为空，请先保存一些对话',
            recallError: '请求失败',
            recallNew: '新对话',
            recallSend: '▶',
            recallHistory: '历史对话',
            recallDeleteConfirm: '确认删除这个对话？',
            tabDistill: '📝 知识沉淀',
            kcSubtabCards: '知识卡片',
            kcSubtabWorkflows: '工作流',
            kcNewCard: '新建知识卡片',
            kcEmptyTitle: '还没有知识卡片',
            kcEmptyTip: '点击「新建知识卡片」选择对话，AI 会帮你生成结构化知识文章。',
            kcPlaceholder: '从左侧选择一个知识卡片查看',
            kcSelectTitle: '选择对话',
            kcCancel: '✕ 取消',
            kcSelectCount: '已选 {n} 个',
            kcGo: '开始沉淀',
            kcGoMin: '请至少选择 2 个对话',
            kcGenerating: '正在生成知识卡片...',
            kcGenerated: '知识卡片已生成',
            kcFailed: '生成失败',
            kcDeleteConfirm: '确认删除该知识卡片？此操作不可撤销。',
            kcEdit: '✏️ 编辑',
            kcSave: '💾 保存',
            kcCancelEdit: '取消',
            kcDelete: '🗑️ 删除',
            kcSources: '来源对话',
            kcMeta: '更新于',
            kcSourceCount: '个来源',
            kcSearchPlaceholder: '搜索对话...',
            wfNew: '新建工作流',
            wfEmptyTitle: '还没有工作流',
            wfEmptyTip: '点击「新建工作流」选择对话，AI 会帮你提取可复用的工作流程。',
            wfPlaceholder: '从左侧选择一个工作流查看',
            wfGenerating: '正在提取工作流...',
            wfGenerated: '工作流已提取',
            wfFailed: '提取失败',
            wfDeleteConfirm: '确认删除该工作流？此操作不可撤销。',
            wfGo: '提取工作流',
            wfGoMin: '请至少选择 2 个对话',
        },
        en: {
            title: '📚 Knowledge Base',
            emptyTitle: 'No conversations yet',
            emptyTip: 'Open this extension on a DeepSeek chat page and click "Save to Knowledge Base".',
            placeholder: 'Select a conversation on the left',
            user: 'User',
            assistant: 'DeepSeek',
            thinking: '💭 Reasoning',
            thinkingHint: 'Thought summary',
            metaSaved: 'Saved',
            metaCount: 'messages',
            origin: '↗ Original',
            del: '🗑️ Delete',
            confirmDel: 'Delete this conversation? This cannot be undone.',
            justNow: 'just now',
            minutesAgo: 'min ago',
            hoursAgo: 'hr ago',
            daysAgo: 'd ago',
            searchPlaceholder: 'Search title / content / reasoning...',
            noResult: 'No matching conversations',
            hits: 'hits',
            summaryReady: '✨ AI Summary',
            summaryPending: '⏳ Generating summary…',
            summaryFailed: '⚠️ Summary failed',
            summaryIdle: 'No summary yet',
            retrySummary: '✨ Retry summary',
            generateSummary: '✨ Generate summary',
            tbSave: 'Save current chat',
            tbSaveOk: 'Saved',
            tbSaveNoChange: 'No changes to save',
            tbSaveExists: 'Updated (overwrote existing)',
            tbSaveFail: 'Save failed',
            tbSaveExtractFail: 'Extraction failed, refresh and retry',
            tbSaveNotOnDS: 'Open a DeepSeek chat page first',
            tbSaveNotOnDSHint: 'If you are already on a chat page, click',
            refresh: 'Refresh',
            tbSaveEmpty: 'No conversation found',
            tabKB: '📚 Knowledge Base',
            tabRecall: '🧠 AI Recall',
            recallWelcomeTitle: 'AI Recall',
            recallWelcomeDesc: 'Search your knowledge base with natural language. I\'ll help you find relevant conversations.',
            recallPlaceholder: 'Type your question...',
            recallThinking: 'Thinking...',
            recallNoResult: 'No relevant conversations found',
            recallNoKey: 'Please configure an API Key in settings first',
            recallEmptyKB: 'Knowledge base is empty, save some conversations first',
            recallError: 'Request failed',
            recallNew: 'New Chat',
            recallSend: '▶',
            recallHistory: 'History',
            recallDeleteConfirm: 'Delete this conversation?',
            tabDistill: '📝 Distill',
            kcSubtabCards: 'Cards',
            kcSubtabWorkflows: 'Workflows',
            kcNewCard: 'New Card',
            kcEmptyTitle: 'No cards yet',
            kcEmptyTip: 'Click "New Card" to select conversations, and AI will generate a structured knowledge article.',
            kcPlaceholder: 'Select a card on the left',
            kcSelectTitle: 'Select Conversations',
            kcCancel: '✕ Cancel',
            kcSelectCount: '{n} selected',
            kcGo: 'Distill',
            kcGoMin: 'Select at least 2 conversations',
            kcGenerating: 'Generating knowledge card...',
            kcGenerated: 'Knowledge card generated',
            kcFailed: 'Generation failed',
            kcDeleteConfirm: 'Delete this knowledge card? This cannot be undone.',
            kcEdit: '✏️ Edit',
            kcSave: '💾 Save',
            kcCancelEdit: 'Cancel',
            kcDelete: '🗑️ Delete',
            kcSources: 'Source Conversations',
            kcMeta: 'Updated',
            kcSourceCount: 'sources',
            kcSearchPlaceholder: 'Search conversations...',
            wfNew: 'New Workflow',
            wfEmptyTitle: 'No workflows yet',
            wfEmptyTip: 'Click "New Workflow" to select conversations, and AI will extract reusable workflows.',
            wfPlaceholder: 'Select a workflow on the left',
            wfGenerating: 'Extracting workflow...',
            wfGenerated: 'Workflow extracted',
            wfFailed: 'Extraction failed',
            wfDeleteConfirm: 'Delete this workflow? This cannot be undone.',
            wfGo: 'Extract Workflow',
            wfGoMin: 'Select at least 2 conversations',
        },
    };

    let lang = 'zh';
    let t = i18n[lang];

    let conversations = [];
    let activeId = null;
    let currentQuery = '';
    let searchDebounceTimer = null;

    const els = {
        title: document.getElementById('sp-title'),
        count: document.getElementById('sp-count'),
        list: document.getElementById('sp-list'),
        empty: document.getElementById('sp-empty'),
        emptyTitle: document.getElementById('sp-empty-title'),
        emptyTip: document.getElementById('sp-empty-tip'),
        noresult: document.getElementById('sp-noresult'),
        noresultText: document.getElementById('sp-noresult-text'),
        searchInput: document.getElementById('sp-search-input'),
        searchClear: document.getElementById('sp-search-clear'),
        placeholder: document.getElementById('sp-placeholder'),
        placeholderText: document.getElementById('sp-placeholder-text'),
        article: document.getElementById('sp-article'),
        articleTitle: document.getElementById('sp-article-title'),
        metaSaved: document.getElementById('sp-article-meta-saved'),
        metaCount: document.getElementById('sp-article-meta-count'),
        link: document.getElementById('sp-article-link'),
        deleteBtn: document.getElementById('sp-delete'),
        summarizeBtn: document.getElementById('sp-summarize'),
        summary: document.getElementById('sp-summary'),
        summaryStatus: document.getElementById('sp-summary-status'),
        summaryBody: document.getElementById('sp-summary-body'),
        summaryTags: document.getElementById('sp-summary-tags'),
        messages: document.getElementById('sp-messages'),
        tbSave: document.getElementById('sp-tb-save'),
        tbSaveLabel: document.getElementById('sp-tb-save-label'),
        toast: document.getElementById('sp-toast'),
        tabKB: document.getElementById('sp-tab-kb'),
        tabRecall: document.getElementById('sp-tab-recall'),
        viewKB: document.getElementById('view-kb'),
        viewRecall: document.getElementById('view-recall'),
        recallMessages: document.getElementById('sp-recall-messages'),
        recallWelcome: document.getElementById('sp-recall-welcome'),
        recallWelcomeTitle: document.getElementById('sp-recall-welcome-title'),
        recallWelcomeDesc: document.getElementById('sp-recall-welcome-desc'),
        recallInput: document.getElementById('sp-recall-input'),
        recallSend: document.getElementById('sp-recall-send'),
        recallNew: document.getElementById('sp-recall-new'),
        recallList: document.getElementById('sp-recall-list'),
        recallHistoryLabel: document.getElementById('sp-recall-history-label'),
        tabDistill: document.getElementById('sp-tab-distill'),
        viewDistill: document.getElementById('view-distill'),
        subtabCards: document.getElementById('sp-subtab-cards'),
        subtabWorkflows: document.getElementById('sp-subtab-workflows'),
        kcListPanel: document.getElementById('sp-distill-cards-panel'),
        kcSelectPanel: document.getElementById('sp-distill-select-panel'),
        kcWorkflowsPanel: document.getElementById('sp-distill-workflows-panel'),
        tbNewCard: document.getElementById('sp-tb-new-card'),
        tbNewCardLabel: document.getElementById('sp-tb-new-card-label'),
        kcList: document.getElementById('sp-kc-list'),
        kcEmpty: document.getElementById('sp-kc-empty'),
        kcEmptyTitle: document.getElementById('sp-kc-empty-title'),
        kcEmptyTip: document.getElementById('sp-kc-empty-tip'),
        kcToast: document.getElementById('sp-distill-toast'),
        kcSelectTitle: document.getElementById('sp-distill-select-title'),
        kcCancel: document.getElementById('sp-distill-cancel'),
        kcSearch: document.getElementById('sp-distill-search'),
        kcSelectList: document.getElementById('sp-distill-select-list'),
        kcSelectCount: document.getElementById('sp-distill-select-count'),
        kcGo: document.getElementById('sp-distill-go'),
        kcGoLabel: document.getElementById('sp-distill-go-label'),
        kcDetail: document.getElementById('sp-kc-detail'),
        kcPlaceholder: document.getElementById('sp-kc-placeholder'),
        kcPlaceholderText: document.getElementById('sp-kc-placeholder-text'),
        kcArticle: document.getElementById('sp-kc-article'),
        kcArticleTitle: document.getElementById('sp-kc-article-title'),
        kcArticleMeta: document.getElementById('sp-kc-article-meta'),
        kcEditBtn: document.getElementById('sp-kc-edit'),
        kcSaveBtn: document.getElementById('sp-kc-save'),
        kcCancelEditBtn: document.getElementById('sp-kc-cancel-edit'),
        kcDeleteBtn: document.getElementById('sp-kc-delete'),
        kcSummary: document.getElementById('sp-kc-summary'),
        kcSummaryText: document.getElementById('sp-kc-summary-text'),
        kcTags: document.getElementById('sp-kc-tags'),
        kcSources: document.getElementById('sp-kc-sources'),
        kcBody: document.getElementById('sp-kc-body'),
        kcEditArea: document.getElementById('sp-kc-edit-area'),
        kcEditTitle: document.getElementById('sp-kc-edit-title'),
        kcEditArticle: document.getElementById('sp-kc-edit-article'),
        tbNewWorkflow: document.getElementById('sp-tb-new-workflow'),
        tbNewWorkflowLabel: document.getElementById('sp-tb-new-workflow-label'),
        wfList: document.getElementById('sp-wf-list'),
        wfEmpty: document.getElementById('sp-wf-empty'),
        wfEmptyTitle: document.getElementById('sp-wf-empty-title'),
        wfEmptyTip: document.getElementById('sp-wf-empty-tip'),
        wfToast: document.getElementById('sp-wf-toast'),
    };

    function applyI18n() {
        els.title.textContent = t.title;
        els.emptyTitle.textContent = t.emptyTitle;
        els.emptyTip.textContent = t.emptyTip;
        els.placeholderText.textContent = t.placeholder;
        els.deleteBtn.textContent = t.del;
        els.searchInput.placeholder = t.searchPlaceholder;
        els.noresultText.textContent = t.noResult;
        els.tbSaveLabel.textContent = t.tbSave;
        els.tabKB.textContent = t.tabKB;
        els.tabRecall.textContent = t.tabRecall;
        if (els.tabDistill) els.tabDistill.textContent = t.tabDistill;
        if (els.subtabCards) els.subtabCards.textContent = t.kcSubtabCards;
        if (els.subtabWorkflows) els.subtabWorkflows.textContent = t.kcSubtabWorkflows;
        if (els.tbNewCardLabel) els.tbNewCardLabel.textContent = t.kcNewCard;
        if (els.kcEmptyTitle) els.kcEmptyTitle.textContent = t.kcEmptyTitle;
        if (els.kcEmptyTip) els.kcEmptyTip.textContent = t.kcEmptyTip;
        if (els.kcPlaceholderText) els.kcPlaceholderText.textContent = t.kcPlaceholder;
        if (els.kcSelectTitle) els.kcSelectTitle.textContent = t.kcSelectTitle;
        if (els.kcCancel) els.kcCancel.textContent = t.kcCancel;
        if (els.kcGoLabel) els.kcGoLabel.textContent = t.kcGo;
        if (els.kcSearch) els.kcSearch.placeholder = t.kcSearchPlaceholder;
        if (els.kcEditBtn) els.kcEditBtn.textContent = t.kcEdit;
        if (els.kcDeleteBtn) els.kcDeleteBtn.textContent = t.kcDelete;
        if (els.tbNewWorkflowLabel) els.tbNewWorkflowLabel.textContent = t.wfNew;
        if (els.wfEmptyTitle) els.wfEmptyTitle.textContent = t.wfEmptyTitle;
        if (els.wfEmptyTip) els.wfEmptyTip.textContent = t.wfEmptyTip;
        els.recallWelcomeTitle.textContent = t.recallWelcomeTitle;
        els.recallWelcomeDesc.textContent = t.recallWelcomeDesc;
        els.recallInput.placeholder = t.recallPlaceholder;
        els.recallNew.title = t.recallNew;
        els.recallHistoryLabel.textContent = t.recallHistory;
    }

    function formatRelative(ts) {
        if (!ts) return '';
        const diff = Date.now() - ts;
        const m = Math.floor(diff / 60000);
        if (m < 1) return t.justNow;
        if (m < 60) return m + ' ' + t.minutesAgo;
        const h = Math.floor(m / 60);
        if (h < 24) return h + ' ' + t.hoursAgo;
        const d = Math.floor(h / 24);
        if (d < 30) return d + ' ' + t.daysAgo;
        const date = new Date(ts);
        return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    }

    function escapeHTML(str) {
        return String(str || '').replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function renderMarkdown(md) {
        if (typeof marked !== 'undefined') {
            try {
                if (marked.parse) return marked.parse(md || '');
                return marked(md || '');
            } catch (_) { /* fallthrough */ }
        }
        return '<pre>' + escapeHTML(md) + '</pre>';
    }

    function escapeRegExp(s) {
        return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 在已转义的 HTML 文本里包 <mark>。escapedHtml 必须先经过 escapeHTML
    function highlightInEscaped(escapedHtml, query) {
        if (!query) return escapedHtml;
        const re = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
        return escapedHtml.replace(re, '<mark class="sp-hl">$1</mark>');
    }

    // 在真实 DOM 中给文本节点包 <mark>，避免破坏 marked 渲染的结构（链接/代码块等）
    function highlightDom(rootEl, query) {
        if (!rootEl || !query) return;
        const re = new RegExp(escapeRegExp(query), 'gi');
        const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !re.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
                const p = node.parentNode;
                if (!p) return NodeFilter.FILTER_REJECT;
                const tag = (p.tagName || '').toUpperCase();
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const targets = [];
        let n;
        while ((n = walker.nextNode())) targets.push(n);
        targets.forEach((node) => {
            const frag = document.createDocumentFragment();
            const text = node.nodeValue;
            const parts = text.split(re);
            const matches = text.match(re) || [];
            parts.forEach((p, i) => {
                if (p) frag.appendChild(document.createTextNode(p));
                if (i < matches.length) {
                    const mark = document.createElement('mark');
                    mark.className = 'sp-hl';
                    mark.textContent = matches[i];
                    frag.appendChild(mark);
                }
            });
            node.parentNode.replaceChild(frag, node);
        });
    }

    async function loadList(query) {
        currentQuery = (query || '').trim();
        const results = await window.KBRepo.searchAll(currentQuery);
        conversations = results;
        renderList();
    }

    function renderList() {
        const totalAll = conversations.length;
        els.count.textContent = totalAll;

        const isSearching = !!currentQuery;
        const noConversationsAtAll = totalAll === 0 && !isSearching;
        const noMatchedInSearch = totalAll === 0 && isSearching;

        if (noConversationsAtAll) {
            els.list.hidden = true;
            els.noresult.hidden = true;
            els.empty.hidden = false;
            els.placeholder.hidden = false;
            els.article.hidden = true;
            return;
        }
        if (noMatchedInSearch) {
            els.list.hidden = true;
            els.empty.hidden = true;
            els.noresult.hidden = false;
            return;
        }
        els.list.hidden = false;
        els.empty.hidden = true;
        els.noresult.hidden = true;

        const q = currentQuery;
        els.list.innerHTML = conversations.map((r) => {
            const c = r.conv;
            const titleHtml = highlightInEscaped(escapeHTML(c.title || 'Untitled'), q);
            // 优先展示摘要，没有则降级到原始预览
            const previewSrc = c.summary || c.preview || '';
            const previewClass = c.summary ? 'sp-list-item-summary' : 'sp-list-item-preview';
            const previewHtml = highlightInEscaped(escapeHTML(previewSrc), q);
            const tagsHtml = (Array.isArray(c.tags) && c.tags.length)
                ? `<div class="sp-list-item-tags">${c.tags.map((tg) => `<span class="sp-list-item-tag">${escapeHTML(tg)}</span>`).join('')}</div>`
                : '';
            let statusHtml = '';
            if (c.summaryStatus === 'pending') {
                statusHtml = `<span class="sp-list-item-status pending">⏳</span>`;
            } else if (c.summaryStatus === 'failed') {
                statusHtml = `<span class="sp-list-item-status failed">⚠️</span>`;
            }
            const snippetHtml = (q && r.snippet)
                ? `<div class="sp-list-item-snippet">${highlightInEscaped(escapeHTML(r.snippet), q)}</div>`
                : '';
            const hitsHtml = (q && r.msgHits > 0)
                ? `<span class="sp-list-item-hits">${r.msgHits} ${t.hits}</span>`
                : '';
            return `
                <div class="sp-list-item${c.id === activeId ? ' active' : ''}" data-id="${escapeHTML(c.id)}">
                    <div class="sp-list-item-title">${titleHtml}${statusHtml}</div>
                    <div class="${previewClass}">${previewHtml}</div>
                    ${tagsHtml}
                    ${snippetHtml}
                    <div class="sp-list-item-meta">
                        <span>${formatRelative(c.savedAt)}</span>
                        <span>${c.messageCount || 0} ${t.metaCount}${hitsHtml}</span>
                    </div>
                </div>
            `;
        }).join('');

        els.list.querySelectorAll('.sp-list-item').forEach((node) => {
            node.addEventListener('click', () => openConversation(node.dataset.id));
        });
    }

    function renderSummaryCard(conv) {
        if (!conv) {
            els.summary.hidden = true;
            els.summarizeBtn.hidden = true;
            return;
        }
        const status = conv.summaryStatus || 'idle';
        els.summary.className = 'sp-summary ' + (status === 'failed' ? 'failed' : status === 'pending' ? 'pending' : '');
        els.summarizeBtn.hidden = false;

        if (status === 'ready' && conv.summary) {
            els.summary.hidden = false;
            els.summaryStatus.textContent = t.summaryReady;
            els.summaryBody.textContent = conv.summary;
            els.summaryTags.innerHTML = (Array.isArray(conv.tags) ? conv.tags : [])
                .map((tg) => `<span class="sp-summary-tag">${escapeHTML(tg)}</span>`).join('');
            els.summarizeBtn.textContent = t.retrySummary;
        } else if (status === 'pending') {
            els.summary.hidden = false;
            els.summaryStatus.textContent = t.summaryPending;
            els.summaryBody.textContent = '';
            els.summaryTags.innerHTML = '';
            els.summarizeBtn.textContent = t.summaryPending;
        } else if (status === 'failed') {
            els.summary.hidden = false;
            const errKind = conv.summaryError || 'unknown';
            const desc = (window.KBErrors && window.KBErrors.describe({ kind: errKind }, 'zh')) || errKind;
            els.summaryStatus.textContent = t.summaryFailed + '：' + desc;
            els.summaryBody.textContent = '';
            els.summaryTags.innerHTML = '';
            els.summarizeBtn.textContent = t.retrySummary;
        } else {
            // idle
            els.summary.hidden = true;
            els.summarizeBtn.textContent = t.generateSummary;
        }
    }

    async function openConversation(id) {
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'view_conversation' });
        activeId = id;
        renderList();

        const conv = await window.KBRepo.getConversation(id);
        if (!conv) return;
        const messages = await window.KBRepo.getMessages(id);

        els.placeholder.hidden = true;
        els.article.hidden = false;
        els.articleTitle.textContent = conv.title || 'Untitled';
        els.metaSaved.textContent = t.metaSaved + ' ' + formatRelative(conv.savedAt);
        els.metaCount.textContent = (conv.messageCount || messages.length) + ' ' + t.metaCount;
        if (conv.url) {
            els.link.href = conv.url;
            els.link.textContent = t.origin;
            els.link.hidden = false;
        } else {
            els.link.hidden = true;
        }

        renderSummaryCard(conv);

        els.messages.innerHTML = messages.map((m) => {
            const roleLabel = m.role === 'user' ? t.user : t.assistant;
            let thinkingHTML = '';
            if (m.role === 'assistant' && (m.thinking || m.thinkingHint)) {
                const hintText = m.thinkingHint ? escapeHTML(m.thinkingHint) : t.thinkingHint;
                thinkingHTML = `
                    <details class="sp-thinking">
                        <summary>${t.thinking} · ${hintText}</summary>
                        <div class="sp-thinking-body">${escapeHTML(m.thinking || '')}</div>
                    </details>
                `;
            }
            const body = m.role === 'assistant'
                ? renderMarkdown(m.content)
                : '<p>' + escapeHTML(m.content).replace(/\n/g, '<br>') + '</p>';
            return `
                <div class="sp-msg ${m.role}">
                    <div class="sp-msg-role">${roleLabel}</div>
                    ${thinkingHTML}
                    <div class="sp-msg-content">${body}</div>
                </div>
            `;
        }).join('');

        if (currentQuery) {
            // 命中思维链时自动展开，便于看到高亮
            els.messages.querySelectorAll('.sp-thinking').forEach((d) => {
                const body = d.querySelector('.sp-thinking-body');
                if (body && body.textContent.toLowerCase().includes(currentQuery.toLowerCase())) {
                    d.open = true;
                }
            });
            highlightDom(els.messages, currentQuery);
            const firstHit = els.messages.querySelector('mark.sp-hl');
            if (firstHit && firstHit.scrollIntoView) {
                firstHit.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }
    }

    els.deleteBtn.addEventListener('click', async () => {
        if (!activeId) return;
        if (!confirm(t.confirmDel)) return;
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'delete_conversation' });
        await window.KBRepo.deleteConversation(activeId);
        activeId = null;
        els.article.hidden = true;
        els.placeholder.hidden = false;
        await loadList(currentQuery);
    });

    els.summarizeBtn.addEventListener('click', () => {
        if (!activeId) return;
        // 立即把 UI 状态切到 pending，无需等 background 回包
        els.summary.hidden = false;
        els.summary.className = 'sp-summary pending';
        els.summaryStatus.textContent = t.summaryPending;
        els.summaryBody.textContent = '';
        els.summaryTags.innerHTML = '';
        els.summarizeBtn.textContent = t.summaryPending;
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'generate_summary' });
        chrome.runtime.sendMessage({ action: 'summarizeConv', id: activeId });
    });

    // ---------------- 工具栏：保存 / 导出 ----------------
    let toastTimer = null;
    function showToast(msg, kind, opts) {
        els.toast.className = 'sp-toast' + (kind ? ' ' + kind : '');
        if (opts && opts.hint) {
            els.toast.innerHTML = escapeHTML(msg) + '<br><span class="sp-toast-hint">' + escapeHTML(opts.hint) + '</span>';
            if (opts.actionText && opts.actionFn) {
                const btn = document.createElement('button');
                btn.className = 'sp-toast-action';
                btn.textContent = opts.actionText;
                btn.addEventListener('click', () => { els.toast.hidden = true; opts.actionFn(); });
                els.toast.querySelector('.sp-toast-hint').appendChild(btn);
            }
        } else {
            els.toast.textContent = msg;
        }
        els.toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2400);
    }

    function showNotOnDSToast() {
        showToast(t.tbSaveNotOnDS, 'error', {
            hint: t.tbSaveNotOnDSHint,
            actionText: t.refresh,
            actionFn: () => { chrome.tabs.reload(); },
        });
    }

    els.tbSave.addEventListener('click', async () => {
        if (els.tbSave.disabled) return;
        try {
            const tabs = await new Promise((resolve) => chrome.tabs.query({ active: true, currentWindow: true }, resolve));
            const tab = tabs && tabs[0];
            if (!tab) {
                showNotOnDSToast();
                return;
            }
            // tab.url 可能因权限不足为空，先按 URL 判断；若取不到再依靠 sendMessage 的失败回退
            if (tab.url && !tab.url.startsWith('https://chat.deepseek.com')) {
                showNotOnDSToast();
                return;
            }
            els.tbSave.disabled = true;
            const resp = await new Promise((resolve) => {
                try {
                    chrome.tabs.sendMessage(tab.id, { action: 'extractStructured' }, (r) => {
                        if (chrome.runtime.lastError) resolve({ __noContentScript: true });
                        else resolve(r);
                    });
                } catch (_) { resolve({ __noContentScript: true }); }
            });
            if (resp && resp.__noContentScript) {
                // 没注入 content script，说明不在 DeepSeek 页
                showNotOnDSToast();
                return;
            }
            if (!resp || !resp.ok || !resp.data) {
                showToast(t.tbSaveExtractFail, 'error');
                return;
            }
            const data = resp.data;
            if (!data.messages || !data.messages.length) {
                showToast(t.tbSaveEmpty, 'error');
                return;
            }
            const result = await window.KBRepo.saveConversation(data);
            if (!result.saved) {
                showToast(t.tbSaveNoChange, 'info');
                return;
            }
            chrome.runtime.sendMessage({ action: 'trackEvent', name: 'save_conversation' });
            showToast(t.tbSaveOk + ' (' + data.messages.length + ')', 'info');
            await loadList(currentQuery);
            // 若已经打开了同一对话，刷新右侧详情
            if (activeId === result.id) openConversation(result.id);
            // 若启用了自动摘要并配置了 Key，触发摘要
            try {
                const meta = window.KBSettings && (await window.KBSettings.getMeta());
                if (meta && meta.autoSummarize && (meta.hasPrimary || meta.hasBackup)) {
                    chrome.runtime.sendMessage({ action: 'summarizeConv', id: result.id });
                }
            } catch (_) { /* 忽略 */ }
        } catch (e) {
            console.error(e);
            showToast(t.tbSaveFail, 'error');
        } finally {
            els.tbSave.disabled = false;
        }
    });

    els.searchInput.addEventListener('input', (e) => {
        const v = e.target.value || '';
        els.searchClear.hidden = !v;
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            if (v) chrome.runtime.sendMessage({ action: 'trackEvent', name: 'search_knowledge_base' });
            loadList(v);
        }, 200);
    });
    els.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            els.searchInput.value = '';
            els.searchClear.hidden = true;
            loadList('');
        }
    });
    els.searchClear.addEventListener('click', () => {
        els.searchInput.value = '';
        els.searchClear.hidden = true;
        loadList('');
        els.searchInput.focus();
    });

    // 监听后台/popup 通知，知识库变化时刷新
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((req) => {
            if (!req || !req.action) return;
            if (req.action === 'kbUpdated') {
                loadList(currentQuery);
            } else if (req.action === 'kbSummaryUpdated') {
                // 仅当影响当前打开的对话时刷新摘要卡
                if (req.id && req.id === activeId) {
                    window.KBRepo.getConversation(activeId).then((conv) => {
                        if (conv) renderSummaryCard(conv);
                    });
                }
                // 列表上的状态徽标也要更新
                loadList(currentQuery);
            } else if (req.action === 'kdUpdated') {
                loadKCList();
            } else if (req.action === 'kdCardUpdated') {
                if (req.id && req.id === kcActiveId) {
                    window.KBRepo.getKnowledgeCard(kcActiveId).then((card) => {
                        if (card) openKnowledgeCard(kcActiveId);
                    });
                }
                loadKCList();
            } else if (req.action === 'kwfUpdated') {
                loadWFList();
            } else if (req.action === 'kwfCardUpdated') {
                if (req.id && req.id === wfActiveId) {
                    window.KBRepo.getWorkflow(wfActiveId).then((wf) => {
                        if (wf) openWorkflow(wfActiveId);
                    });
                }
                loadWFList();
            }
        });
    }

    applyI18n();
    loadList('');

    // 从 content.js "查看" 按钮跳转过来时，自动打开指定对话
    chrome.storage.local.get('pendingOpenConvId', (res) => {
        if (res.pendingOpenConvId) {
            chrome.storage.local.remove('pendingOpenConvId');
            openConversation(res.pendingOpenConvId);
            switchTab('kb');
        }
    });
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.pendingOpenConvId && changes.pendingOpenConvId.newValue) {
            chrome.storage.local.remove('pendingOpenConvId');
            openConversation(changes.pendingOpenConvId.newValue);
            switchTab('kb');
        }
    });

    // ---------------- 语言切换 ----------------
    function setLanguage(newLang) {
        if (newLang !== 'zh' && newLang !== 'en') newLang = 'zh';
        if (newLang === lang) return;
        lang = newLang;
        t = i18n[lang];
        document.documentElement.lang = lang;
        applyI18n();
        loadList(currentQuery);
        if (activeId) openConversation(activeId);
    }

    chrome.storage.local.get('language', (res) => {
        const saved = res.language || 'zh';
        if (saved !== lang) setLanguage(saved);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.language) {
            setLanguage(changes.language.newValue);
        }
    });

    // ---------------- Tab 切换 ----------------
    const tabMap = { kb: els.tabKB, recall: els.tabRecall, distill: els.tabDistill };
    const viewMap = { kb: els.viewKB, recall: els.viewRecall, distill: els.viewDistill };
    function switchTab(tab) {
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'switch_tab', params: { tab: tab } });
        for (const [k, btn] of Object.entries(tabMap)) {
            if (btn) btn.classList.toggle('active', k === tab);
            if (viewMap[k]) viewMap[k].hidden = (k !== tab);
        }
    }

    els.tabKB.addEventListener('click', () => switchTab('kb'));
    els.tabRecall.addEventListener('click', () => switchTab('recall'));
    els.tabDistill.addEventListener('click', () => switchTab('distill'));

    // ---------------- AI 回忆 ----------------
    let recallPort = null;
    let recallConvMap = {};
    let recallHistory = [];
    let recallStreamContent = '';
    let recallActiveId = null; // 当前选中的 recall 会话 id（null = 未保存的新对话）
    let recallTitleGenerated = false; // 当前会话是否已生成过标题

    function abortRecallStream() {
        if (recallPort) {
            try { recallPort.disconnect(); } catch (_) {}
            recallPort = null;
        }
    }

    // ---- 历史列表 ----
    async function loadRecallList() {
        const resp = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'listRecallConvs' }, resolve);
        });
        renderRecallList((resp && resp.list) || []);
    }

    function renderRecallList(convs) {
        els.recallList.innerHTML = '';
        for (const c of convs) {
            const item = document.createElement('div');
            item.className = 'sp-recall-item' + (c.id === recallActiveId ? ' active' : '');
            item.dataset.id = c.id;

            const title = document.createElement('div');
            title.className = 'sp-recall-item-title';
            title.textContent = c.title || 'New Chat';

            const time = document.createElement('div');
            time.className = 'sp-recall-item-time';
            time.textContent = formatRelative(c.updatedAt);

            const del = document.createElement('button');
            del.className = 'sp-recall-item-del';
            del.textContent = '×';
            del.title = '删除';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteRecallConvById(c.id);
            });

            item.appendChild(title);
            item.appendChild(time);
            item.appendChild(del);
            item.addEventListener('click', () => switchRecallConv(c.id));
            els.recallList.appendChild(item);
        }
    }

    function highlightRecallItem() {
        els.recallList.querySelectorAll('.sp-recall-item').forEach((el) => {
            el.classList.toggle('active', el.dataset.id === recallActiveId);
        });
    }

    async function switchRecallConv(id) {
        if (id === recallActiveId) return;
        abortRecallStream();

        const conv = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'listRecallConvs' }, (resp) => {
                const list = (resp && resp.list) || [];
                resolve(list.find((c) => c.id === id) || null);
            });
        });
        if (!conv) return;

        recallActiveId = id;
        recallHistory = (conv.messages || []).slice();
        recallTitleGenerated = true;
        recallConvMap = {};
        highlightRecallItem();

        // 渲染消息
        els.recallMessages.innerHTML = '';
        els.recallWelcome.hidden = true;
        for (const m of recallHistory) {
            appendRecallMessage(m.role, m.content);
        }
    }

    function createNewRecallConv() {
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'new_recall_conversation' });
        abortRecallStream();
        recallActiveId = null;
        recallHistory = [];
        recallConvMap = {};
        recallStreamContent = '';
        recallTitleGenerated = false;
        highlightRecallItem();
        els.recallMessages.innerHTML = '';
        els.recallMessages.appendChild(els.recallWelcome);
        els.recallWelcome.hidden = false;
    }

    async function deleteRecallConvById(id) {
        if (!confirm(t.recallDeleteConfirm)) return;
        await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'deleteRecallConv', id }, resolve);
        });
        if (id === recallActiveId) {
            createNewRecallConv();
        }
        loadRecallList();
    }

    // 持久化当前会话消息到 IDB
    async function persistRecallMessages() {
        if (!recallActiveId || !recallHistory.length) return;
        await new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: 'saveRecallConv',
                data: { id: recallActiveId, messages: recallHistory },
            }, resolve);
        });
    }

    // 生成标题并保存新会话
    async function generateTitleAndSave(firstQuestion) {
        const resp = await new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: 'generateRecallTitle',
                question: firstQuestion,
            }, resolve);
        });
        const title = (resp && resp.ok && resp.title) || firstQuestion.slice(0, 20);

        const saveResp = await new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: 'saveRecallConv',
                data: { title, messages: recallHistory },
            }, resolve);
        });
        if (saveResp && saveResp.ok) {
            recallActiveId = saveResp.id;
            recallTitleGenerated = true;
            loadRecallList();
        }
    }

    els.recallNew.addEventListener('click', createNewRecallConv);

    // 点击外部链接时用新标签页打开（sidepanel 内不能直接导航）
    els.recallMessages.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.href || '';
        if (a.classList.contains('sp-recall-link') || href === '#' || href.startsWith('#')) return;
        e.preventDefault();
        chrome.tabs.create({ url: href });
    });

    function appendRecallMessage(role, content, opts) {
        opts = opts || {};
        els.recallWelcome.hidden = true;

        const bubble = document.createElement('div');
        bubble.className = 'sp-recall-bubble ' + role;
        if (opts.streaming) bubble.classList.add('streaming');

        if (role === 'system') {
            bubble.textContent = content;
        } else {
            bubble.innerHTML = renderMarkdown(content);
            makeConvLinksClickable(bubble);
        }

        els.recallMessages.appendChild(bubble);
        els.recallMessages.scrollTop = els.recallMessages.scrollHeight;
        return bubble;
    }

    function makeConvLinksClickable(container) {
        const pattern = /\[\[CONV:([^|\]]+)\|([^\]]+)\]\]/g;
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        const targets = [];
        let node;
        while ((node = walker.nextNode())) {
            if (pattern.test(node.nodeValue)) targets.push(node);
        }
        pattern.lastIndex = 0;

        targets.forEach((textNode) => {
            const text = textNode.nodeValue;
            const frag = document.createDocumentFragment();
            let lastIdx = 0;
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(text))) {
                if (match.index > lastIdx) {
                    frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
                }
                const id = match[1];
                const title = match[2];
                const a = document.createElement('a');
                a.className = 'sp-recall-link';
                a.textContent = title;
                a.href = '#';
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchTab('kb');
                    openConversation(id);
                });
                frag.appendChild(a);
                lastIdx = match.index + match[0].length;
            }
            if (lastIdx < text.length) {
                frag.appendChild(document.createTextNode(text.slice(lastIdx)));
            }
            textNode.parentNode.replaceChild(frag, textNode);
        });
    }

    function sendRecallQuery(query) {
        query = (query || '').trim();
        if (!query) return;

        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'ai_recall_query' });
        abortRecallStream();

        const isFirstMessage = recallHistory.length === 0;

        appendRecallMessage('user', query);
        recallHistory.push({ role: 'user', content: query });

        const bubble = appendRecallMessage('assistant', t.recallThinking, { streaming: true });
        recallStreamContent = '';

        const port = chrome.runtime.connect({ name: 'recallStream' });
        recallPort = port;

        port.onMessage.addListener((msg) => {
            if (msg.type === 'convMap') {
                recallConvMap = msg.data || {};
            } else if (msg.type === 'chunk') {
                recallStreamContent += (msg.text || '');
                bubble.innerHTML = renderMarkdown(recallStreamContent);
                bubble.classList.add('streaming');
                makeConvLinksClickable(bubble);
                els.recallMessages.scrollTop = els.recallMessages.scrollHeight;
            } else if (msg.type === 'done') {
                bubble.classList.remove('streaming');
                if (recallStreamContent) {
                    recallHistory.push({ role: 'assistant', content: recallStreamContent });
                }
                recallPort = null;
                // 持久化
                if (isFirstMessage) {
                    generateTitleAndSave(query);
                } else if (recallActiveId) {
                    persistRecallMessages();
                }
            } else if (msg.type === 'error') {
                bubble.classList.remove('streaming');
                let errMsg = t.recallError;
                if (msg.kind === 'no_key') errMsg = t.recallNoKey;
                else if (msg.kind === 'empty_kb') errMsg = t.recallEmptyKB;
                else if (msg.kind === 'empty_query') return;
                else if (msg.message) errMsg += '：' + msg.message;
                bubble.className = 'sp-recall-bubble system';
                bubble.textContent = errMsg;
                recallPort = null;
            }
        });

        port.onDisconnect.addListener(() => {
            if (recallPort === port) {
                recallPort = null;
                bubble.classList.remove('streaming');
            }
        });

        port.postMessage({
            action: 'recallQuery',
            query: query,
            history: recallHistory.slice(0, -1),
        });
    }

    // 输入事件
    els.recallSend.addEventListener('click', () => {
        const q = els.recallInput.value;
        if (q.trim()) {
            sendRecallQuery(q);
            els.recallInput.value = '';
            els.recallInput.style.height = 'auto';
        }
    });

    els.recallInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            els.recallSend.click();
        }
    });

    els.recallInput.addEventListener('input', () => {
        els.recallInput.style.height = 'auto';
        els.recallInput.style.height = Math.min(els.recallInput.scrollHeight, 120) + 'px';
    });

    // ---------------- 知识沉淀 ----------------
    let knowledgeCards = [];
    let kcActiveId = null;
    let kcSelectedIds = new Set();
    let kcEditing = false;
    let kcSelectDebounceTimer = null;
    let kcToastTimer = null;

    let workflows = [];
    let wfActiveId = null;
    let selectMode = 'card'; // 'card' | 'workflow'
    let detailMode = 'card'; // 'card' | 'workflow'
    let wfToastTimer = null;

    function showKCToast(msg, kind) {
        if (!els.kcToast) return;
        els.kcToast.textContent = msg;
        els.kcToast.className = 'sp-toast' + (kind ? ' ' + kind : '');
        els.kcToast.hidden = false;
        clearTimeout(kcToastTimer);
        kcToastTimer = setTimeout(() => { els.kcToast.hidden = true; }, 2400);
    }

    function showWFToast(msg, kind) {
        if (!els.wfToast) return;
        els.wfToast.textContent = msg;
        els.wfToast.className = 'sp-toast' + (kind ? ' ' + kind : '');
        els.wfToast.hidden = false;
        clearTimeout(wfToastTimer);
        wfToastTimer = setTimeout(() => { els.wfToast.hidden = true; }, 2400);
    }

    async function loadKCList() {
        knowledgeCards = await window.KBRepo.listKnowledgeCards();
        renderKCList();
    }

    function renderKCList() {
        if (!els.kcList) return;
        if (knowledgeCards.length === 0) {
            els.kcList.hidden = true;
            els.kcEmpty.hidden = false;
            return;
        }
        els.kcList.hidden = false;
        els.kcEmpty.hidden = true;

        els.kcList.innerHTML = knowledgeCards.map((card) => {
            let statusHtml = '';
            if (card.status === 'pending') {
                statusHtml = '<span class="sp-list-item-status pending">⏳</span>';
            } else if (card.status === 'failed') {
                statusHtml = '<span class="sp-list-item-status failed">⚠️</span>';
            }
            const tagsHtml = (Array.isArray(card.tags) && card.tags.length)
                ? '<div class="sp-list-item-tags">' + card.tags.map((tg) => '<span class="sp-list-item-tag">' + escapeHTML(tg) + '</span>').join('') + '</div>'
                : '';
            const sourceCount = (card.sourceIds || []).length;
            return '<div class="sp-list-item sp-kc-item' + (card.id === kcActiveId ? ' active' : '') + '" data-id="' + escapeHTML(card.id) + '">'
                + '<div class="sp-list-item-title">' + escapeHTML(card.title || 'Untitled') + statusHtml + '</div>'
                + (card.summary ? '<div class="sp-list-item-summary">' + escapeHTML(card.summary) + '</div>' : '')
                + tagsHtml
                + '<div class="sp-list-item-meta">'
                + '<span>' + formatRelative(card.updatedAt) + '</span>'
                + '<span>' + sourceCount + ' ' + t.kcSourceCount + '</span>'
                + '</div></div>';
        }).join('');

        els.kcList.querySelectorAll('.sp-list-item').forEach((node) => {
            node.addEventListener('click', () => openKnowledgeCard(node.dataset.id));
        });
    }

    async function openKnowledgeCard(id) {
        kcActiveId = id;
        kcEditing = false;
        renderKCList();

        const card = await window.KBRepo.getKnowledgeCard(id);
        if (!card) return;

        els.kcPlaceholder.hidden = true;
        els.kcArticle.hidden = false;
        els.kcEditArea.hidden = true;
        els.kcBody.hidden = false;
        els.kcSummary.hidden = false;
        els.kcTags.hidden = false;
        els.kcSources.hidden = false;
        els.kcEditBtn.hidden = false;
        els.kcSaveBtn.hidden = true;
        els.kcCancelEditBtn.hidden = true;

        els.kcArticleTitle.textContent = card.title || 'Untitled';
        els.kcArticleMeta.textContent = t.kcMeta + ' ' + formatRelative(card.updatedAt);

        if (card.status === 'pending') {
            els.kcBody.innerHTML = '<div class="sp-summary pending"><div class="sp-summary-header"><span>⏳</span><span>' + t.kcGenerating + '</span></div></div>';
        } else if (card.status === 'failed') {
            const errKind = card.errorKind || 'unknown';
            const desc = (window.KBErrors && window.KBErrors.describe({ kind: errKind }, lang)) || errKind;
            els.kcBody.innerHTML = '<div class="sp-summary failed"><div class="sp-summary-header"><span>⚠️</span><span>' + t.kcFailed + '：' + escapeHTML(desc) + '</span></div></div>';
        } else {
            els.kcBody.innerHTML = renderMarkdown(card.article || '');
        }

        els.kcSummaryText.textContent = card.summary || '';
        els.kcTags.innerHTML = (Array.isArray(card.tags) ? card.tags : [])
            .map((tg) => '<span class="sp-kc-tag">' + escapeHTML(tg) + '</span>').join('');

        const sourceIds = card.sourceIds || [];
        const sourceTitles = card.sourceTitles || [];
        if (sourceIds.length > 0) {
            els.kcSources.hidden = false;
            els.kcSources.innerHTML = '<div class="sp-kc-sources-title">' + t.kcSources + '</div>'
                + sourceIds.map((sid, i) => {
                    const title = sourceTitles[i] || sid;
                    return '<a class="sp-kc-source-link" data-conv-id="' + escapeHTML(sid) + '">' + escapeHTML(title) + '</a>';
                }).join('');
            els.kcSources.querySelectorAll('.sp-kc-source-link').forEach((link) => {
                link.addEventListener('click', () => {
                    const convId = link.dataset.convId;
                    switchTab('kb');
                    openConversation(convId);
                });
            });
        } else {
            els.kcSources.hidden = true;
        }
    }

    // 选择模式
    function enterSelectionMode(mode) {
        selectMode = mode || 'card';
        kcSelectedIds.clear();
        els.kcListPanel.hidden = true;
        els.kcWorkflowsPanel.hidden = true;
        els.kcSelectPanel.hidden = false;
        els.kcSearch.value = '';
        // 更新按钮文案
        if (els.kcGoLabel) {
            els.kcGoLabel.textContent = selectMode === 'workflow' ? t.wfGo : t.kcGo;
        }
        renderSelectList('');
        updateSelectCount();
    }

    function exitSelectionMode() {
        els.kcSelectPanel.hidden = true;
        if (selectMode === 'workflow') {
            els.kcWorkflowsPanel.hidden = false;
            els.kcListPanel.hidden = true;
        } else {
            els.kcListPanel.hidden = false;
            els.kcWorkflowsPanel.hidden = true;
        }
        kcSelectedIds.clear();
    }

    async function renderSelectList(query) {
        const results = await window.KBRepo.searchAll(query);
        els.kcSelectList.innerHTML = results.map((r) => {
            const c = r.conv;
            const selected = kcSelectedIds.has(c.id);
            const titleHtml = escapeHTML(c.title || 'Untitled');
            const previewHtml = escapeHTML(c.summary || c.preview || '');
            return '<div class="sp-distill-select-item' + (selected ? ' selected' : '') + '" data-id="' + escapeHTML(c.id) + '">'
                + '<input type="checkbox"' + (selected ? ' checked' : '') + '>'
                + '<div>'
                + '<div class="sp-list-item-title">' + titleHtml + '</div>'
                + (previewHtml ? '<div class="sp-list-item-preview">' + previewHtml + '</div>' : '')
                + '<div class="sp-list-item-meta"><span>' + formatRelative(c.savedAt) + '</span></div>'
                + '</div></div>';
        }).join('');

        els.kcSelectList.querySelectorAll('.sp-distill-select-item').forEach((node) => {
            node.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                const cb = node.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = !cb.checked;
                toggleKCSelection(node.dataset.id);
            });
            const cb = node.querySelector('input[type="checkbox"]');
            if (cb) {
                cb.addEventListener('change', () => toggleKCSelection(node.dataset.id));
            }
        });
    }

    function toggleKCSelection(convId) {
        if (kcSelectedIds.has(convId)) {
            kcSelectedIds.delete(convId);
        } else {
            kcSelectedIds.add(convId);
        }
        // 更新选中样式
        els.kcSelectList.querySelectorAll('.sp-distill-select-item').forEach((node) => {
            const selected = kcSelectedIds.has(node.dataset.id);
            node.classList.toggle('selected', selected);
            const cb = node.querySelector('input[type="checkbox"]');
            if (cb) cb.checked = selected;
        });
        updateSelectCount();
    }

    function updateSelectCount() {
        const n = kcSelectedIds.size;
        els.kcSelectCount.textContent = t.kcSelectCount.replace('{n}', n);
        els.kcGo.disabled = n < 2;
    }

    // 事件绑定
    if (els.tbNewCard) {
        els.tbNewCard.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'trackEvent', name: 'start_create_knowledge_card' });
            enterSelectionMode('card');
        });
    }
    if (els.kcCancel) {
        els.kcCancel.addEventListener('click', exitSelectionMode);
    }
    if (els.kcSearch) {
        els.kcSearch.addEventListener('input', (e) => {
            const v = e.target.value || '';
            clearTimeout(kcSelectDebounceTimer);
            kcSelectDebounceTimer = setTimeout(() => renderSelectList(v), 200);
        });
    }

    // 沉淀触发
    if (els.kcGo) {
        els.kcGo.addEventListener('click', async () => {
            if (kcSelectedIds.size < 2) {
                if (selectMode === 'workflow') {
                    showWFToast(t.wfGoMin, 'error');
                } else {
                    showKCToast(t.kcGoMin, 'error');
                }
                return;
            }
            const sourceIds = Array.from(kcSelectedIds);
            if (selectMode === 'workflow') {
                const result = await window.KBRepo.saveWorkflow({
                    title: t.wfGenerating,
                    article: '',
                    summary: '',
                    tags: [],
                    sourceIds: sourceIds,
                    sourceTitles: [],
                    status: 'pending',
                    errorKind: '',
                });
                exitSelectionMode();
                await loadWFList();
                openWorkflow(result.id);
                showWFToast(t.wfGenerating, 'info');
                chrome.runtime.sendMessage({ action: 'trackEvent', name: 'extract_workflow' });
                chrome.runtime.sendMessage({
                    action: 'extractWorkflow',
                    wfId: result.id,
                    sourceIds: sourceIds,
                });
            } else {
                const result = await window.KBRepo.saveKnowledgeCard({
                    title: t.kcGenerating,
                    article: '',
                    summary: '',
                    tags: [],
                    sourceIds: sourceIds,
                    sourceTitles: [],
                    status: 'pending',
                    errorKind: '',
                });
                exitSelectionMode();
                await loadKCList();
                openKnowledgeCard(result.id);
                showKCToast(t.kcGenerating, 'info');
                chrome.runtime.sendMessage({ action: 'trackEvent', name: 'distill_knowledge_card' });
                chrome.runtime.sendMessage({
                    action: 'distillConversations',
                    cardId: result.id,
                    sourceIds: sourceIds,
                });
            }
        });
    }

    // 编辑
    if (els.kcEditBtn) {
        els.kcEditBtn.addEventListener('click', async () => {
            const isWf = detailMode === 'workflow';
            const activeId = isWf ? wfActiveId : kcActiveId;
            if (!activeId) return;
            const item = isWf
                ? await window.KBRepo.getWorkflow(activeId)
                : await window.KBRepo.getKnowledgeCard(activeId);
            if (!item) return;
            kcEditing = true;
            els.kcEditTitle.value = item.title || '';
            els.kcEditArticle.value = item.article || '';
            els.kcBody.hidden = true;
            els.kcSummary.hidden = true;
            els.kcTags.hidden = true;
            els.kcEditArea.hidden = false;
            els.kcEditBtn.hidden = true;
            els.kcSaveBtn.hidden = false;
            els.kcCancelEditBtn.hidden = false;
        });
    }

    if (els.kcSaveBtn) {
        els.kcSaveBtn.addEventListener('click', async () => {
            const isWf = detailMode === 'workflow';
            const activeId = isWf ? wfActiveId : kcActiveId;
            if (!activeId) return;
            const newTitle = els.kcEditTitle.value.trim();
            const newArticle = els.kcEditArticle.value;
            if (isWf) {
                await window.KBRepo.updateWorkflow(activeId, { title: newTitle, article: newArticle });
                kcEditing = false;
                await loadWFList();
                openWorkflow(activeId);
                showWFToast(t.kcSave, 'info');
            } else {
                await window.KBRepo.updateKnowledgeCard(activeId, { title: newTitle, article: newArticle });
                kcEditing = false;
                await loadKCList();
                openKnowledgeCard(activeId);
                showKCToast(t.kcSave, 'info');
            }
        });
    }

    if (els.kcCancelEditBtn) {
        els.kcCancelEditBtn.addEventListener('click', () => {
            kcEditing = false;
            if (detailMode === 'workflow') {
                if (wfActiveId) openWorkflow(wfActiveId);
            } else {
                if (kcActiveId) openKnowledgeCard(kcActiveId);
            }
        });
    }

    if (els.kcDeleteBtn) {
        els.kcDeleteBtn.addEventListener('click', () => {
            const isWf = detailMode === 'workflow';
            const activeId = isWf ? wfActiveId : kcActiveId;
            if (!activeId) return;
            const confirmMsg = isWf ? t.wfDeleteConfirm : t.kcDeleteConfirm;
            if (!confirm(confirmMsg)) return;
            if (isWf) {
                chrome.runtime.sendMessage({ action: 'deleteWorkflow', id: activeId }, () => {
                    wfActiveId = null;
                    els.kcArticle.hidden = true;
                    els.kcPlaceholder.hidden = false;
                    loadWFList();
                });
            } else {
                chrome.runtime.sendMessage({ action: 'deleteKnowledgeCard', id: activeId }, () => {
                    kcActiveId = null;
                    els.kcArticle.hidden = true;
                    els.kcPlaceholder.hidden = false;
                    loadKCList();
                });
            }
        });
    }

    // 子 tab 切换
    if (els.subtabCards) {
        els.subtabCards.addEventListener('click', () => {
            els.subtabCards.classList.add('active');
            els.subtabWorkflows.classList.remove('active');
            els.kcListPanel.hidden = false;
            els.kcSelectPanel.hidden = true;
            els.kcWorkflowsPanel.hidden = true;
            detailMode = 'card';
            if (kcActiveId) {
                openKnowledgeCard(kcActiveId);
            } else {
                els.kcPlaceholder.hidden = false;
                els.kcArticle.hidden = true;
            }
        });
    }
    if (els.subtabWorkflows) {
        els.subtabWorkflows.addEventListener('click', () => {
            els.subtabWorkflows.classList.add('active');
            els.subtabCards.classList.remove('active');
            els.kcWorkflowsPanel.hidden = false;
            els.kcListPanel.hidden = true;
            els.kcSelectPanel.hidden = true;
            detailMode = 'workflow';
            if (wfActiveId) {
                openWorkflow(wfActiveId);
            } else {
                els.kcPlaceholder.hidden = false;
                els.kcArticle.hidden = true;
            }
        });
    }

    // ---------------- 工作流 ----------------
    async function loadWFList() {
        workflows = await window.KBRepo.listWorkflows();
        renderWFList();
    }

    function renderWFList() {
        if (!els.wfList) return;
        if (workflows.length === 0) {
            els.wfList.hidden = true;
            els.wfEmpty.hidden = false;
            return;
        }
        els.wfList.hidden = false;
        els.wfEmpty.hidden = true;

        els.wfList.innerHTML = workflows.map((wf) => {
            let statusHtml = '';
            if (wf.status === 'pending') {
                statusHtml = '<span class="sp-list-item-status pending">⏳</span>';
            } else if (wf.status === 'failed') {
                statusHtml = '<span class="sp-list-item-status failed">⚠️</span>';
            }
            const tagsHtml = (Array.isArray(wf.tags) && wf.tags.length)
                ? '<div class="sp-list-item-tags">' + wf.tags.map((tg) => '<span class="sp-list-item-tag">' + escapeHTML(tg) + '</span>').join('') + '</div>'
                : '';
            const sourceCount = (wf.sourceIds || []).length;
            return '<div class="sp-list-item sp-wf-item' + (wf.id === wfActiveId ? ' active' : '') + '" data-id="' + escapeHTML(wf.id) + '">'
                + '<div class="sp-list-item-title">' + escapeHTML(wf.title || 'Untitled') + statusHtml + '</div>'
                + (wf.summary ? '<div class="sp-list-item-summary">' + escapeHTML(wf.summary) + '</div>' : '')
                + tagsHtml
                + '<div class="sp-list-item-meta">'
                + '<span>' + formatRelative(wf.updatedAt) + '</span>'
                + '<span>' + sourceCount + ' ' + t.kcSourceCount + '</span>'
                + '</div></div>';
        }).join('');

        els.wfList.querySelectorAll('.sp-list-item').forEach((node) => {
            node.addEventListener('click', () => openWorkflow(node.dataset.id));
        });
    }

    async function openWorkflow(id) {
        wfActiveId = id;
        detailMode = 'workflow';
        renderWFList();

        const wf = await window.KBRepo.getWorkflow(id);
        if (!wf) return;

        els.kcPlaceholder.hidden = true;
        els.kcArticle.hidden = false;
        els.kcEditArea.hidden = true;
        els.kcBody.hidden = false;
        els.kcSummary.hidden = false;
        els.kcTags.hidden = false;
        els.kcSources.hidden = false;
        els.kcEditBtn.hidden = false;
        els.kcSaveBtn.hidden = true;
        els.kcCancelEditBtn.hidden = true;

        els.kcArticleTitle.textContent = wf.title || 'Untitled';
        els.kcArticleMeta.textContent = t.kcMeta + ' ' + formatRelative(wf.updatedAt);

        if (wf.status === 'pending') {
            els.kcBody.innerHTML = '<div class="sp-summary pending"><div class="sp-summary-header"><span>⏳</span><span>' + t.wfGenerating + '</span></div></div>';
        } else if (wf.status === 'failed') {
            const errKind = wf.errorKind || 'unknown';
            const desc = (window.KBErrors && window.KBErrors.describe({ kind: errKind }, lang)) || errKind;
            els.kcBody.innerHTML = '<div class="sp-summary failed"><div class="sp-summary-header"><span>⚠️</span><span>' + t.wfFailed + '：' + escapeHTML(desc) + '</span></div></div>';
        } else {
            els.kcBody.innerHTML = renderMarkdown(wf.article || '');
        }

        els.kcSummaryText.textContent = wf.summary || '';
        els.kcTags.innerHTML = (Array.isArray(wf.tags) ? wf.tags : [])
            .map((tg) => '<span class="sp-kc-tag">' + escapeHTML(tg) + '</span>').join('');

        const sourceIds = wf.sourceIds || [];
        const sourceTitles = wf.sourceTitles || [];
        if (sourceIds.length > 0) {
            els.kcSources.hidden = false;
            els.kcSources.innerHTML = '<div class="sp-kc-sources-title">' + t.kcSources + '</div>'
                + sourceIds.map((sid, i) => {
                    const title = sourceTitles[i] || sid;
                    return '<a class="sp-kc-source-link" data-conv-id="' + escapeHTML(sid) + '">' + escapeHTML(title) + '</a>';
                }).join('');
            els.kcSources.querySelectorAll('.sp-kc-source-link').forEach((link) => {
                link.addEventListener('click', () => {
                    const convId = link.dataset.convId;
                    switchTab('kb');
                    openConversation(convId);
                });
            });
        } else {
            els.kcSources.hidden = true;
        }
    }

    if (els.tbNewWorkflow) {
        els.tbNewWorkflow.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'trackEvent', name: 'start_create_workflow' });
            enterSelectionMode('workflow');
        });
    }

    // 初始化加载历史列表
    loadRecallList();
    loadKCList();
    loadWFList();
})();
