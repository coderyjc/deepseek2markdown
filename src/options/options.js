// 设置页主逻辑
(function () {
    // ---------------- i18n ----------------
    const i18n = {
        zh: {
            pageTitle: 'DeepSeek Copilot - 设置',
            header: '⚙️ 设置',
            subtitle: '本地优先 · API Key 加密存储 · 数据不离开浏览器',
            onboardTitle: '👋 首次使用',
            onboardStep1: '在 <a href="https://platform.deepseek.com/api_keys" target="_blank">DeepSeek 开放平台</a> 申请 API Key',
            onboardStep2: '把 Key 粘贴到下方「主 Key」输入框',
            onboardStep3: '点击「测试连接」确认可用 → 保存',
            generalTitle: '🌐 通用',
            languageLabel: '界面语言：',
            languageHint: '切换后会同步应用到弹窗、知识库和所有界面。',
            keyTitle: '🔑 API Key（BYOK）',
            keySubtitle: '两个 Key 槽位，可作主备切换或多账号隔离。',
            keyPrimary: '主 Key',
            keyBackup: '备用 Key',
            backupPlaceholder: 'sk-...（可选）',
            toggleVisibility: '显示/隐藏',
            btnTest: '测试',
            btnSave: '保存',
            btnClear: '清除',
            btnReset: '重置',
            activeLabel: '当前活跃：',
            modelTitle: '🤖 模型与行为',
            modelLabel: '模型：',
            modelChat: 'deepseek-chat（V4 通用）',
            modelReasoner: 'deepseek-reasoner（R1 推理）',
            autoSummarize: '入库时自动生成 AI 摘要 + 标签',
            autoSave: '自动保存对话到知识库',
            usageTitle: '📊 用量统计',
            usageCalls: '调用次数',
            usagePrompt: '输入 tokens',
            usageCompletion: '输出 tokens',
            usageCost: '估算成本',
            statusSavedHint: '已保存（输入新值可覆盖）',
            statusPlaceholder: 'sk-...',
            statusEnterKey: '请先输入 Key',
            statusTesting: '测试中...',
            statusOK: '✓ 连接成功',
            statusFailPrefix: '✗ ',
            statusSaving: '保存中...',
            statusNoChange: '没有变化',
            statusEnterKeyShort: '请输入 Key',
            statusSavedEnc: '✓ 已保存（已加密）',
            statusSaveFail: '✗ 保存失败：',
            statusCleared: '已清除',
            confirmClearKey: '确认清除该 Key？',
            confirmResetUsage: '重置用量统计？',
            sincePrefix: '自 ',
            sinceSuffix: ' 起',
            errFallback: '调用失败',
            exportTitle: '📦 导出',
            exportSubtitle: '将数据打包为 ZIP 文件下载到本地。',
            exportKB: '📦 导出知识库',
            exportCards: '📦 导出知识卡片',
            exportWorkflows: '📦 导出工作流',
            exportEmpty: '暂无数据',
            exportExporting: '正在打包...',
            exportOK: '已导出',
            exportFail: '导出失败',
        },
        en: {
            pageTitle: 'DeepSeek Copilot - Settings',
            header: '⚙️ Settings',
            subtitle: 'Local-first · API keys are encrypted · Data stays in your browser',
            onboardTitle: '👋 Getting Started',
            onboardStep1: 'Get an API Key from <a href="https://platform.deepseek.com/api_keys" target="_blank">DeepSeek Platform</a>',
            onboardStep2: 'Paste the key into the "Primary Key" field below',
            onboardStep3: 'Click "Test" to verify, then "Save"',
            generalTitle: '🌐 General',
            languageLabel: 'Language:',
            languageHint: 'Applies to popup, knowledge base, and all other surfaces.',
            keyTitle: '🔑 API Key (BYOK)',
            keySubtitle: 'Two key slots — use as primary/backup or to isolate accounts.',
            keyPrimary: 'Primary Key',
            keyBackup: 'Backup Key',
            backupPlaceholder: 'sk-... (optional)',
            toggleVisibility: 'Show / Hide',
            btnTest: 'Test',
            btnSave: 'Save',
            btnClear: 'Clear',
            btnReset: 'Reset',
            activeLabel: 'Active slot:',
            modelTitle: '🤖 Model & Behavior',
            modelLabel: 'Model:',
            modelChat: 'deepseek-chat (V4 general)',
            modelReasoner: 'deepseek-reasoner (R1 reasoning)',
            autoSummarize: 'Auto-generate AI summary + tags on save',
            autoSave: 'Auto-save conversations to knowledge base',
            usageTitle: '📊 Usage',
            usageCalls: 'Calls',
            usagePrompt: 'Prompt tokens',
            usageCompletion: 'Completion tokens',
            usageCost: 'Estimated cost',
            statusSavedHint: 'Saved (enter new value to overwrite)',
            statusPlaceholder: 'sk-...',
            statusEnterKey: 'Please enter a Key',
            statusTesting: 'Testing...',
            statusOK: '✓ Connected',
            statusFailPrefix: '✗ ',
            statusSaving: 'Saving...',
            statusNoChange: 'No change',
            statusEnterKeyShort: 'Please enter a Key',
            statusSavedEnc: '✓ Saved (encrypted)',
            statusSaveFail: '✗ Save failed: ',
            statusCleared: 'Cleared',
            confirmClearKey: 'Clear this Key?',
            confirmResetUsage: 'Reset usage stats?',
            sincePrefix: 'Since ',
            sinceSuffix: '',
            errFallback: 'Request failed',
            exportTitle: '📦 Export',
            exportSubtitle: 'Package data as ZIP files for download.',
            exportKB: '📦 Export Knowledge Base',
            exportCards: '📦 Export Knowledge Cards',
            exportWorkflows: '📦 Export Workflows',
            exportEmpty: 'No data yet',
            exportExporting: 'Packaging...',
            exportOK: 'Exported',
            exportFail: 'Export failed',
        },
    };

    let currentLang = 'zh';
    let t = i18n.zh;

    function applyI18n() {
        document.documentElement.lang = currentLang;
        document.title = t.pageTitle;
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.dataset.i18n;
            if (t[key] !== undefined) el.textContent = t[key];
        });
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.dataset.i18nHtml;
            if (t[key] !== undefined) el.innerHTML = t[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.dataset.i18nPlaceholder;
            if (t[key] !== undefined) el.placeholder = t[key];
        });
        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.dataset.i18nTitle;
            if (t[key] !== undefined) el.title = t[key];
        });
        // 输入框已有/未保存的提示文案需要在 refresh() 阶段重新写
    }

    // ---------------- 页面元素 ----------------
    const els = {
        onboarding: document.getElementById('onboarding'),

        languageSelect: document.getElementById('language-select'),

        primaryInput: document.getElementById('primary-input'),
        primaryToggle: document.getElementById('primary-toggle'),
        primaryTest: document.getElementById('primary-test'),
        primarySave: document.getElementById('primary-save'),
        primaryClear: document.getElementById('primary-clear'),
        primaryStatus: document.getElementById('primary-status'),

        backupInput: document.getElementById('backup-input'),
        backupToggle: document.getElementById('backup-toggle'),
        backupTest: document.getElementById('backup-test'),
        backupSave: document.getElementById('backup-save'),
        backupClear: document.getElementById('backup-clear'),
        backupStatus: document.getElementById('backup-status'),

        activePrimary: document.getElementById('active-primary'),
        activeBackup: document.getElementById('active-backup'),

        modelSelect: document.getElementById('model-select'),
        autoSummarize: document.getElementById('auto-summarize'),
        autoSave: document.getElementById('auto-save'),

        uCalls: document.getElementById('u-calls'),
        uPrompt: document.getElementById('u-prompt'),
        uCompletion: document.getElementById('u-completion'),
        uCost: document.getElementById('u-cost'),
        uSince: document.getElementById('u-since'),
        resetUsage: document.getElementById('reset-usage'),

        exportKB: document.getElementById('export-kb'),
        exportCards: document.getElementById('export-cards'),
        exportWorkflows: document.getElementById('export-workflows'),
        exportStatus: document.getElementById('export-status'),
    };

    // 仅展示遮罩，真实 Key 永不回显
    const PLACEHOLDER = '••••••••••••••••';

    function setStatus(el, text, kind) {
        el.textContent = text || '';
        el.className = 'status' + (kind ? ' ' + kind : '');
    }

    function describeError(err) {
        return (window.KBErrors && window.KBErrors.describe(err, currentLang)) || (err && err.message) || t.errFallback;
    }

    // V3 chat 价格（DeepSeek 公开价；非缓存命中粗算用，仅作展示）
    function estimateCostUSD(usage) {
        const inUSDPerM = 0.27;
        const outUSDPerM = 1.10;
        const cost = (usage.promptTokens / 1e6) * inUSDPerM + (usage.completionTokens / 1e6) * outUSDPerM;
        return '$' + cost.toFixed(4);
    }

    function formatTime(ts) {
        if (!ts) return '';
        const d = new Date(ts);
        return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    async function refresh() {
        const meta = await window.KBSettings.getMeta();

        // O-01b: 引导仅在两个 Key 都为空时展示
        els.onboarding.hidden = !!(meta.hasPrimary || meta.hasBackup);

        els.primaryInput.value = meta.hasPrimary ? PLACEHOLDER : '';
        els.backupInput.value = meta.hasBackup ? PLACEHOLDER : '';
        els.primaryInput.placeholder = meta.hasPrimary ? t.statusSavedHint : t.statusPlaceholder;
        els.backupInput.placeholder = meta.hasBackup ? t.statusSavedHint : t.backupPlaceholder;

        els.activePrimary.checked = meta.activeSlot === 'primary';
        els.activeBackup.checked = meta.activeSlot === 'backup';
        els.activePrimary.disabled = !meta.hasPrimary;
        els.activeBackup.disabled = !meta.hasBackup;

        els.modelSelect.value = meta.model || 'deepseek-chat';
        els.autoSummarize.checked = !!meta.autoSummarize;
        els.autoSave.checked = !!meta.autoSave;

        els.uCalls.textContent = meta.usage.calls || 0;
        els.uPrompt.textContent = meta.usage.promptTokens || 0;
        els.uCompletion.textContent = meta.usage.completionTokens || 0;
        els.uCost.textContent = estimateCostUSD(meta.usage);
        els.uSince.textContent = t.sincePrefix + formatTime(meta.usage.lastReset) + t.sinceSuffix;
    }

    function readKeyFromInput(input) {
        const v = input.value || '';
        if (v === PLACEHOLDER) return null; // 用户没改
        return v.trim();
    }

    // 通过 background 测试 Key（需要 host 权限发请求；options 页本身也有，但走 background 统一一些）
    function testKeyViaBg(apiKey, model) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'testApiKey', apiKey, model }, (resp) => {
                resolve(resp || { ok: false, kind: 'unknown' });
            });
        });
    }

    function bindKeyRow(slot) {
        const isPrimary = slot === 'primary';
        const input = isPrimary ? els.primaryInput : els.backupInput;
        const toggle = isPrimary ? els.primaryToggle : els.backupToggle;
        const testBtn = isPrimary ? els.primaryTest : els.backupTest;
        const saveBtn = isPrimary ? els.primarySave : els.backupSave;
        const clearBtn = isPrimary ? els.primaryClear : els.backupClear;
        const statusEl = isPrimary ? els.primaryStatus : els.backupStatus;

        toggle.addEventListener('click', async () => {
            if (input.type === 'password') {
                // 解密并显示真实 Key
                const meta = await window.KBSettings.getMeta();
                const hasKey = isPrimary ? meta.hasPrimary : meta.hasBackup;
                if (hasKey && input.value === PLACEHOLDER) {
                    const real = await readSlotKey(slot);
                    if (real) input.value = real;
                }
                input.type = 'text';
            } else {
                // 隐藏：若内容是真实 Key，恢复遮罩
                input.type = 'password';
                const meta = await window.KBSettings.getMeta();
                const hasKey = isPrimary ? meta.hasPrimary : meta.hasBackup;
                if (hasKey) input.value = PLACEHOLDER;
            }
        });

        testBtn.addEventListener('click', async () => {
            let key = readKeyFromInput(input);
            if (key === null) {
                // 用户没改，测试已存的
                const active = await window.KBSettings.getActiveKey();
                // 只测当前 slot 的 key
                const meta = await window.KBSettings.getMeta();
                if ((isPrimary && !meta.hasPrimary) || (!isPrimary && !meta.hasBackup)) {
                    setStatus(statusEl, t.statusEnterKey, 'fail');
                    return;
                }
                // 直接重读一次目标 slot 的明文
                const cur = await readSlotKey(slot);
                key = cur;
            }
            if (!key) {
                setStatus(statusEl, t.statusEnterKey, 'fail');
                return;
            }
            setStatus(statusEl, t.statusTesting, 'pending');
            const r = await testKeyViaBg(key, els.modelSelect.value);
            if (r.ok) setStatus(statusEl, t.statusOK, 'ok');
            else setStatus(statusEl, t.statusFailPrefix + describeError({ kind: r.kind, message: r.message }), 'fail');
        });

        saveBtn.addEventListener('click', async () => {
            const key = readKeyFromInput(input);
            if (key === null) { setStatus(statusEl, t.statusNoChange, ''); return; }
            if (!key) { setStatus(statusEl, t.statusEnterKeyShort, 'fail'); return; }
            setStatus(statusEl, t.statusSaving, 'pending');
            try {
                await window.KBSettings.setKey(slot, key);
                // 若另一槽位为空，自动设为活跃
                const meta = await window.KBSettings.getMeta();
                if (slot === 'primary' && !meta.hasBackup) await window.KBSettings.setActiveSlot('primary');
                if (slot === 'backup' && !meta.hasPrimary) await window.KBSettings.setActiveSlot('backup');
                chrome.runtime.sendMessage({ action: 'trackEvent', name: 'save_api_key', params: { slot: slot } });
                setStatus(statusEl, t.statusSavedEnc, 'ok');
                await refresh();
            } catch (e) {
                setStatus(statusEl, t.statusSaveFail + (e && e.message || e), 'fail');
            }
        });

        clearBtn.addEventListener('click', async () => {
            if (!confirm(t.confirmClearKey)) return;
            await window.KBSettings.clearKey(slot);
            setStatus(statusEl, t.statusCleared, '');
            await refresh();
        });
    }

    // 借用 settings 解密：临时切换活跃 slot 读出来再切回
    async function readSlotKey(slot) {
        const meta = await window.KBSettings.getMeta();
        const orig = meta.activeSlot;
        if (orig !== slot) await window.KBSettings.setActiveSlot(slot);
        const active = await window.KBSettings.getActiveKey();
        if (orig !== slot) await window.KBSettings.setActiveSlot(orig);
        return active && active.key;
    }

    bindKeyRow('primary');
    bindKeyRow('backup');

    els.activePrimary.addEventListener('change', async () => {
        if (els.activePrimary.checked) await window.KBSettings.setActiveSlot('primary');
    });
    els.activeBackup.addEventListener('change', async () => {
        if (els.activeBackup.checked) await window.KBSettings.setActiveSlot('backup');
    });

    els.modelSelect.addEventListener('change', async () => {
        await window.KBSettings.setModel(els.modelSelect.value);
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'change_model', params: { model: els.modelSelect.value } });
    });
    els.autoSummarize.addEventListener('change', async () => {
        await window.KBSettings.setAutoSummarize(els.autoSummarize.checked);
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'toggle_auto_summarize', params: { enabled: els.autoSummarize.checked } });
    });
    els.autoSave.addEventListener('change', async () => {
        await window.KBSettings.setAutoSave(els.autoSave.checked);
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'toggle_auto_save', params: { enabled: els.autoSave.checked } });
    });

    els.resetUsage.addEventListener('click', async () => {
        if (!confirm(t.confirmResetUsage)) return;
        await window.KBSettings.resetUsage();
        await refresh();
    });

    // ---------------- 语言下拉 ----------------
    function setLanguage(lang) {
        if (lang !== 'zh' && lang !== 'en') lang = 'zh';
        currentLang = lang;
        t = i18n[lang];
        els.languageSelect.value = lang;
        applyI18n();
        refresh();
    }

    els.languageSelect.addEventListener('change', () => {
        const lang = els.languageSelect.value;
        chrome.storage.local.set({ language: lang });
        setLanguage(lang);
    });

    // 初始化语言：读取 storage 里的 language（与 popup 共用同一 key）
    chrome.storage.local.get('language', (res) => {
        setLanguage(res.language || 'zh');
    });

    // 其它界面（popup）若改了语言，这里实时同步
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.language && changes.language.newValue !== currentLang) {
            setLanguage(changes.language.newValue);
        }
    });

    refresh();

    // ---------------- 导出 ----------------
    function sanitizeFilename(name) {
        return String(name || 'untitled')
            .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 80) || 'untitled';
    }

    function timestamp() {
        const d = new Date();
        return d.getFullYear()
            + String(d.getMonth() + 1).padStart(2, '0')
            + String(d.getDate()).padStart(2, '0')
            + '_' + String(d.getHours()).padStart(2, '0')
            + String(d.getMinutes()).padStart(2, '0');
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function tagsToHashtags(tags) {
        if (!Array.isArray(tags) || !tags.length) return '';
        return tags.map((tg) => {
            const safe = String(tg).trim().replace(/\s+/g, '_').replace(/[#`]/g, '');
            return safe ? '#' + safe : '';
        }).filter(Boolean).join(' ');
    }

    function buildConversationMarkdown(conv, messages) {
        const parts = [];
        parts.push('# ' + (conv.title || 'Untitled'));
        parts.push('');
        if (conv.summary) {
            parts.push('## AI 摘要');
            parts.push('');
            const lines = String(conv.summary).split(/\r?\n/);
            for (const line of lines) parts.push('> ' + line);
            parts.push('');
        }
        const hashtags = tagsToHashtags(conv.tags);
        if (hashtags) {
            parts.push('## 标签');
            parts.push('');
            parts.push(hashtags);
            parts.push('');
        }
        if (conv.url) {
            parts.push('[↗ 原对话](' + conv.url + ')');
            parts.push('');
        }
        parts.push('## 对话');
        parts.push('');
        for (const m of messages) {
            const roleLabel = m.role === 'user' ? '用户' : 'DeepSeek';
            parts.push('### ' + roleLabel);
            parts.push('');
            if (m.role === 'assistant' && m.thinking) {
                parts.push('<details><summary>思维链</summary>');
                parts.push('');
                parts.push(m.thinking);
                parts.push('');
                parts.push('</details>');
                parts.push('');
            }
            parts.push(m.content || '');
            parts.push('');
        }
        return parts.join('\n');
    }

    function buildCardMarkdown(card) {
        const parts = [];
        parts.push('# ' + (card.title || 'Untitled'));
        parts.push('');
        if (card.summary) {
            parts.push('> ' + card.summary);
            parts.push('');
        }
        const hashtags = tagsToHashtags(card.tags);
        if (hashtags) {
            parts.push('## 标签');
            parts.push('');
            parts.push(hashtags);
            parts.push('');
        }
        parts.push(card.article || '');
        return parts.join('\n');
    }

    function buildWorkflowMarkdown(wf) {
        const parts = [];
        parts.push('# ' + (wf.title || 'Untitled'));
        parts.push('');
        if (wf.summary) {
            parts.push('> ' + wf.summary);
            parts.push('');
        }
        const hashtags = tagsToHashtags(wf.tags);
        if (hashtags) {
            parts.push('## 标签');
            parts.push('');
            parts.push(hashtags);
            parts.push('');
        }
        parts.push(wf.article || '');
        return parts.join('\n');
    }

    async function exportKnowledgeBase() {
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'export_knowledge_base_zip' });
        try {
            const list = await window.KBRepo.listConversations();
            if (!list.length) {
                els.exportStatus.textContent = t.exportEmpty;
                els.exportStatus.className = 'status';
                return;
            }
            els.exportStatus.textContent = t.exportExporting;
            els.exportStatus.className = 'status pending';
            const zw = new window.ZipWriter();
            const usedNames = new Map();
            for (const conv of list) {
                const messages = await window.KBRepo.getMessages(conv.id);
                const md = buildConversationMarkdown(conv, messages);
                const base = sanitizeFilename(conv.title || 'untitled');
                const dupCount = usedNames.get(base) || 0;
                usedNames.set(base, dupCount + 1);
                const filename = (dupCount === 0 ? base : base + '_' + (dupCount + 1)) + '.md';
                zw.add(filename, md);
            }
            const blob = zw.build();
            downloadBlob(blob, 'deepseek-knowledge-base_' + timestamp() + '.zip');
            els.exportStatus.textContent = t.exportOK + ' (' + list.length + ')';
            els.exportStatus.className = 'status ok';
        } catch (e) {
            console.error(e);
            els.exportStatus.textContent = t.exportFail;
            els.exportStatus.className = 'status fail';
        }
    }

    async function exportKnowledgeCards() {
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'export_knowledge_cards_zip' });
        try {
            const list = await window.KBRepo.listKnowledgeCards();
            if (!list.length) {
                els.exportStatus.textContent = t.exportEmpty;
                els.exportStatus.className = 'status';
                return;
            }
            els.exportStatus.textContent = t.exportExporting;
            els.exportStatus.className = 'status pending';
            const zw = new window.ZipWriter();
            const usedNames = new Map();
            for (const card of list) {
                const md = buildCardMarkdown(card);
                const base = sanitizeFilename(card.title || 'untitled');
                const dupCount = usedNames.get(base) || 0;
                usedNames.set(base, dupCount + 1);
                const filename = (dupCount === 0 ? base : base + '_' + (dupCount + 1)) + '.md';
                zw.add(filename, md);
            }
            const blob = zw.build();
            downloadBlob(blob, 'deepseek-knowledge-cards_' + timestamp() + '.zip');
            els.exportStatus.textContent = t.exportOK + ' (' + list.length + ')';
            els.exportStatus.className = 'status ok';
        } catch (e) {
            console.error(e);
            els.exportStatus.textContent = t.exportFail;
            els.exportStatus.className = 'status fail';
        }
    }

    async function exportWorkflows() {
        chrome.runtime.sendMessage({ action: 'trackEvent', name: 'export_workflows_zip' });
        try {
            const list = await window.KBRepo.listWorkflows();
            if (!list.length) {
                els.exportStatus.textContent = t.exportEmpty;
                els.exportStatus.className = 'status';
                return;
            }
            els.exportStatus.textContent = t.exportExporting;
            els.exportStatus.className = 'status pending';
            const zw = new window.ZipWriter();
            const usedNames = new Map();
            for (const wf of list) {
                const md = buildWorkflowMarkdown(wf);
                const base = sanitizeFilename(wf.title || 'untitled');
                const dupCount = usedNames.get(base) || 0;
                usedNames.set(base, dupCount + 1);
                const filename = (dupCount === 0 ? base : base + '_' + (dupCount + 1)) + '.md';
                zw.add(filename, md);
            }
            const blob = zw.build();
            downloadBlob(blob, 'deepseek-workflows_' + timestamp() + '.zip');
            els.exportStatus.textContent = t.exportOK + ' (' + list.length + ')';
            els.exportStatus.className = 'status ok';
        } catch (e) {
            console.error(e);
            els.exportStatus.textContent = t.exportFail;
            els.exportStatus.className = 'status fail';
        }
    }

    els.exportKB.addEventListener('click', exportKnowledgeBase);
    els.exportCards.addEventListener('click', exportKnowledgeCards);
    els.exportWorkflows.addEventListener('click', exportWorkflows);
})();
