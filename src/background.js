// MV3 Service Worker：摘要任务调度器 + 知识库变更广播
importScripts(
    'db/schema.js',
    'db/repo.js',
    'security/crypto.js',
    'ai/settings.js',
    'ai/prompts.js',
    'ai/deepseek.js',
    'ai/errors.js',
    'analytics.js'
);

// ----- 首次安装引导数据 -----
const SEED_I18N = {
    zh: {
        kbTitle: '快速了解知识库',
        kbSummary: '您需要在设置中配置 DeepSeek API Key 才能够使用 AI 摘要功能。',
        kbTags: ['教程', '开始使用', '知识库'],
        kbUser: '知识库是什么？',
        kbAssistant: [
            '知识库是 DeepSeek Copilot 的核心功能之一，它可以帮助你将 DeepSeek 对话保存到本地浏览器中，方便随时查阅和搜索。',
            '',
            '## 主要功能',
            '',
            '### 1. 保存对话',
            '在 DeepSeek 对话页面，点击知识库左栏的「保存当前对话」按钮，即可将当前对话保存到知识库中。',
            '',
            '### 2. AI 摘要',
            '保存对话后，插件会自动调用 DeepSeek API 生成对话摘要和标签，帮助你快速了解每条对话的核心内容。使用前需要在设置中配置 API Key。',
            '',
            '### 3. 搜索与浏览',
            '在侧边栏知识库中，你可以通过关键词搜索所有已保存的对话，也可以按标签筛选，快速找到需要的内容。',
            '',
            '### 4. AI 回忆',
            '切换到「AI 回忆」标签页，用自然语言向 AI 提问，它会自动搜索知识库中的相关对话并给出回答，就像拥有了一个了解你所有对话的助手。',
            '',
            '## 如何开始',
            '',
            '1. 在 DeepSeek 对话页面打开本插件',
            '2. 点击「保存当前对话」将对话加入知识库',
            '3. 在侧边栏中浏览、搜索你的对话',
            '4. 配置 API Key 后即可使用 AI 摘要和 AI 回忆功能',
            '',
            '提示：你也可以在设置中开启「自动保存」，这样每次对话都会自动加入知识库。',
            '',
            '提示：可以在设置界面打包导出知识库。',
        ].join('\n'),
        recallTitle: '快速了解AI回忆',
        recallUser: 'AI回忆是什么？',
        recallAssistant: [
            'AI 回忆是 DeepSeek Copilot 的智能搜索功能，它让你可以用自然语言搜索知识库中的所有对话。',
            '',
            '## 它能做什么？',
            '',
            '- **自然语言搜索**：不需要记住关键词，直接用问题描述你想找的内容，AI 会理解你的意图并找到相关对话。',
            '- **关联对话**：AI 会综合多条对话的内容给出完整回答，并附上原始对话的链接，方便你深入了解。',
            '- **支持追问**：你可以像和真人对话一样继续追问，AI 会基于已有上下文持续回答。',
            '',
            '## 如何使用？',
            '',
            '1. 先在知识库中保存一些对话',
            '2. 切换到「AI 回忆」标签页',
            '3. 输入你的问题，例如「上次我问过关于 React 的问题是什么？」',
            '4. AI 会搜索知识库并给出回答',
            '',
            '注意：使用 AI 回忆需要在设置中配置 DeepSeek API Key。',
        ].join('\n'),
        kcTitle: '快速了解知识卡片',
        kcTags: ['教程', '开始使用', '知识卡片'],
        kcArticle: [
            '# 快速了解知识卡片',
            '',
            '知识卡片是「知识沉淀」功能的核心模块，它可以将多条相关对话合成为一篇结构化的知识文章。',
            '',
            '## 它能做什么？',
            '',
            '- **多对话合成**：选择 2 条以上的对话，AI 会自动分析并提取关键知识，生成一篇完整的知识文章。',
            '- **结构化输出**：生成的文章包含标题、章节、核心概念、关键要点和来源引用，方便阅读和回顾。',
            '- **可编辑**：生成后你可以自由编辑标题和文章内容，完善自己的知识体系。',
            '- **标签管理**：每张卡片自动生成标签，便于分类和检索。',
            '',
            '## 如何使用？',
            '',
            '1. 切换到「知识沉淀」标签页，选择「知识卡片」子标签',
            '2. 点击「新建知识卡片」',
            '3. 在弹出的对话列表中勾选你想合成的对话（至少 2 条）',
            '4. 点击「开始沉淀」，等待 AI 生成',
            '5. 生成完成后可以查看、编辑或删除卡片',
            '',
            '注意：使用知识卡片需要在设置中配置 DeepSeek API Key。',
            '',
            '提示：可以在设置界面打包导出知识卡片。',
        ].join('\n'),
        wfTitle: '快速了解工作流',
        wfTags: ['教程', '开始使用', '工作流'],
        wfArticle: [
            '# 快速了解工作流',
            '',
            '工作流是「知识沉淀」功能的另一个模块，它可以从多条对话中提取可重复使用的工作流程。',
            '',
            '## 它能做什么？',
            '',
            '- **流程提取**：AI 会分析对话内容，提取出可复用的操作步骤、关键提示和常见错误修正。',
            '- **结构化输出**：生成的工作流包含目标、前提条件、逐步操作、重要提示、错误与修正、预期结果等完整结构。',
            '- **可编辑**：生成后你可以自由编辑内容，优化工作流程。',
            '',
            '## 工作流 vs 知识卡片',
            '',
            '| | 知识卡片 | 工作流 |',
            '|---|---|---|',
            '| 侧重点 | 知识与概念 | 操作与流程 |',
            '| 适用场景 | 学习笔记、技术总结 | 任务清单、操作指南 |',
            '| 输出结构 | 章节式知识文章 | 步骤式工作流程 |',
            '',
            '## 如何使用？',
            '',
            '1. 切换到「知识沉淀」标签页，选择「工作流」子标签',
            '2. 点击「新建工作流」',
            '3. 选择相关对话（至少 2 条）',
            '4. 点击「提取工作流」，等待 AI 生成',
            '5. 生成完成后可以查看、编辑或删除',
            '',
            '注意：使用工作流需要在设置中配置 DeepSeek API Key。',
            '',
            '提示：可以在设置界面打包导出工作流。',
        ].join('\n'),
    },
    en: {
        kbTitle: 'Quick Start: Knowledge Base',
        kbSummary: 'You need to configure a DeepSeek API Key in Settings to use the AI summary feature.',
        kbTags: ['Tutorial', 'Getting Started', 'Knowledge Base'],
        kbUser: 'What is the Knowledge Base?',
        kbAssistant: [
            'The Knowledge Base is a core feature of DeepSeek Copilot. It lets you save DeepSeek conversations to your local browser for easy access and search.',
            '',
            '## Key Features',
            '',
            '### 1. Save Conversations',
            'On a DeepSeek chat page, click the "Save Current Chat" button in the left panel of the Knowledge Base to save the conversation.',
            '',
            '### 2. AI Summary',
            'After saving, the extension automatically calls the DeepSeek API to generate a summary and tags for each conversation. You need to configure an API Key in Settings first.',
            '',
            '### 3. Search & Browse',
            'In the sidebar Knowledge Base, you can search all saved conversations by keyword or filter by tags to quickly find what you need.',
            '',
            '### 4. AI Recall',
            'Switch to the "AI Recall" tab and ask questions in natural language. It will automatically search the Knowledge Base and answer based on your saved conversations.',
            '',
            '## Getting Started',
            '',
            '1. Open this extension on a DeepSeek chat page',
            '2. Click "Save Current Chat" to add the conversation to your Knowledge Base',
            '3. Browse and search your conversations in the sidebar',
            '4. Configure an API Key to enable AI Summary and AI Recall',
            '',
            'Tip: You can enable "Auto Save" in Settings to automatically save every conversation.',
            '',
            'Tip: You can export the Knowledge Base as a ZIP file from the Settings page.',
        ].join('\n'),
        recallTitle: 'Quick Start: AI Recall',
        recallUser: 'What is AI Recall?',
        recallAssistant: [
            'AI Recall is DeepSeek Copilot\'s intelligent search feature. It lets you search your Knowledge Base using natural language.',
            '',
            '## What can it do?',
            '',
            '- **Natural language search**: No need to remember keywords. Just describe what you\'re looking for and AI will find relevant conversations.',
            '- **Cross-conversation answers**: AI synthesizes content from multiple conversations into a complete answer with links to the originals.',
            '- **Follow-up questions**: You can ask follow-up questions just like talking to a person, and AI will continue answering with full context.',
            '',
            '## How to use?',
            '',
            '1. First save some conversations to your Knowledge Base',
            '2. Switch to the "AI Recall" tab',
            '3. Type your question, e.g. "What was the React question I asked before?"',
            '4. AI will search the Knowledge Base and provide an answer',
            '',
            'Note: AI Recall requires a DeepSeek API Key configured in Settings.',
        ].join('\n'),
        kcTitle: 'Quick Start: Knowledge Cards',
        kcTags: ['Tutorial', 'Getting Started', 'Knowledge Cards'],
        kcArticle: [
            '# Quick Start: Knowledge Cards',
            '',
            'Knowledge Cards is the core module of the "Knowledge Distillation" feature. It synthesizes multiple related conversations into a structured knowledge article.',
            '',
            '## What can it do?',
            '',
            '- **Multi-conversation synthesis**: Select 2 or more conversations, and AI will automatically extract key knowledge to generate a complete article.',
            '- **Structured output**: Generated articles include titles, sections, core concepts, key takeaways, and source references.',
            '- **Editable**: After generation, you can freely edit the title and article content to refine your knowledge.',
            '- **Tag management**: Each card automatically generates tags for easy categorization and retrieval.',
            '',
            '## How to use?',
            '',
            '1. Switch to the "Knowledge Distillation" tab and select the "Knowledge Cards" sub-tab',
            '2. Click "New Card"',
            '3. Check the conversations you want to synthesize (at least 2)',
            '4. Click "Distill" and wait for AI to generate',
            '5. View, edit, or delete the card once generated',
            '',
            'Note: Knowledge Cards require a DeepSeek API Key configured in Settings.',
            '',
            'Tip: You can export Knowledge Cards as a ZIP file from the Settings page.',
        ].join('\n'),
        wfTitle: 'Quick Start: Workflows',
        wfTags: ['Tutorial', 'Getting Started', 'Workflows'],
        wfArticle: [
            '# Quick Start: Workflows',
            '',
            'Workflows is another module of the "Knowledge Distillation" feature. It extracts reusable workflows from multiple conversations.',
            '',
            '## What can it do?',
            '',
            '- **Workflow extraction**: AI analyzes conversation content to extract reusable steps, key tips, and common error fixes.',
            '- **Structured output**: Generated workflows include goal, prerequisites, step-by-step operations, key tips, errors & fixes, and expected outcomes.',
            '- **Editable**: After generation, you can freely edit the content to optimize your workflow.',
            '',
            '## Workflows vs Knowledge Cards',
            '',
            '| | Knowledge Cards | Workflows |',
            '|---|---|---|',
            '| Focus | Knowledge & concepts | Operations & processes |',
            '| Use case | Study notes, tech summaries | Task checklists, how-to guides |',
            '| Output | Sectioned knowledge article | Step-by-step workflow |',
            '',
            '## How to use?',
            '',
            '1. Switch to the "Knowledge Distillation" tab and select the "Workflows" sub-tab',
            '2. Click "New Workflow"',
            '3. Select related conversations (at least 2)',
            '4. Click "Extract Workflow" and wait for AI to generate',
            '5. View, edit, or delete once generated',
            '',
            'Note: Workflows require a DeepSeek API Key configured in Settings.',
            '',
            'Tip: You can export Workflows as a ZIP file from the Settings page.',
        ].join('\n'),
    },
};

async function seedDefaults() {
    try {
        const lang = await new Promise((resolve) => {
            chrome.storage.local.get('language', (res) => resolve(res.language || 'zh'));
        });
        const s = SEED_I18N[lang] || SEED_I18N.zh;

        // 知识库
        await self.KBRepo.saveConversation({
            id: 'seed_kb_intro',
            title: s.kbTitle,
            messages: [
                { role: 'user', content: s.kbUser },
                { role: 'assistant', content: s.kbAssistant },
            ],
        });
        await self.KBRepo.updateSummary('seed_kb_intro', {
            summary: s.kbSummary,
            tags: s.kbTags,
            summaryStatus: 'ready',
        });

        // AI 回忆
        await self.KBRepo.saveRecallConv({
            id: 'seed_recall_intro',
            title: s.recallTitle,
            messages: [
                { role: 'user', content: s.recallUser },
                { role: 'assistant', content: s.recallAssistant },
            ],
        });

        // 知识卡片
        await self.KBRepo.saveKnowledgeCard({
            id: 'seed_kc_intro',
            title: s.kcTitle,
            summary: s.kbSummary,
            tags: s.kcTags,
            status: 'ready',
            article: s.kcArticle,
        });

        // 工作流
        await self.KBRepo.saveWorkflow({
            id: 'seed_wf_intro',
            title: s.wfTitle,
            summary: s.kbSummary,
            tags: s.wfTags,
            status: 'ready',
            article: s.wfArticle,
        });
    } catch (e) {
        console.error('[Seed] Failed to seed defaults:', e);
    }
}

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        seedDefaults();
        self.GA4.track('extension_installed');
    }
});

// ----- 工具 -----
function broadcast(action, payload) {
    try {
        chrome.runtime.sendMessage(Object.assign({ action }, payload || {}));
    } catch (_) { /* sidepanel 未打开时忽略 */ }
}

function buildConversationText(conv, messages) {
    const lines = [];
    if (conv.title) lines.push('# ' + conv.title);
    for (const m of messages) {
        if (m.role === 'user') {
            lines.push('\n## User\n' + (m.content || ''));
        } else {
            lines.push('\n## DeepSeek\n' + (m.content || ''));
        }
    }
    return lines.join('\n');
}

const inFlight = new Set();
const distillInFlight = new Set();
const workflowInFlight = new Set();

async function summarizeConversation(id) {
    if (inFlight.has(id)) return { ok: false, kind: 'busy' };
    inFlight.add(id);
    try {
        const conv = await self.KBRepo.getConversation(id);
        if (!conv) return { ok: false, kind: 'not_found' };

        const meta = await self.KBSettings.getMeta();
        if (!meta.hasPrimary && !meta.hasBackup) {
            await self.KBRepo.updateSummary(id, { summaryStatus: 'failed', summaryError: 'no_key' });
            broadcast('kbSummaryUpdated', { id, status: 'failed', kind: 'no_key' });
            return { ok: false, kind: 'no_key' };
        }

        await self.KBRepo.updateSummary(id, { summaryStatus: 'pending', summaryError: '' });
        broadcast('kbSummaryUpdated', { id, status: 'pending' });

        const active = await self.KBSettings.getActiveKey();
        if (!active || !active.key) {
            await self.KBRepo.updateSummary(id, { summaryStatus: 'failed', summaryError: 'no_key' });
            broadcast('kbSummaryUpdated', { id, status: 'failed', kind: 'no_key' });
            return { ok: false, kind: 'no_key' };
        }

        const messages = await self.KBRepo.getMessages(id);
        const text = buildConversationText(conv, messages);

        try {
            const result = await self.KBDeepSeek.summarize(text, { apiKey: active.key, model: meta.model });
            if (result.usage) {
                await self.KBSettings.bumpUsage(result.usage);
            }
            await self.KBRepo.updateSummary(id, {
                summary: result.summary,
                tags: result.tags,
                summaryStatus: 'ready',
                summaryError: '',
            });
            broadcast('kbSummaryUpdated', { id, status: 'ready' });
            broadcast('kbUpdated');
            self.GA4.track('ai_summary_call');
            return { ok: true };
        } catch (err) {
            const kind = (err && err.kind) || 'unknown';
            await self.KBRepo.updateSummary(id, {
                summaryStatus: 'failed',
                summaryError: kind,
            });
            broadcast('kbSummaryUpdated', { id, status: 'failed', kind });
            return { ok: false, kind, message: String(err && err.message || err) };
        }
    } finally {
        inFlight.delete(id);
    }
}

async function handleAutoSave(data) {
    try {
        const meta = await self.KBSettings.getMeta();
        if (!meta.autoSave) return { ok: false, reason: 'disabled' };

        const result = await self.KBRepo.saveConversation(data);
        if (!result.saved) return { ok: true, id: result.id, skipped: true };

        self.GA4.track('auto_save_conversation');
        // 通知 sidepanel/popup 刷新
        broadcast('kbUpdated');

        // 若自动摘要开启且有 Key，触发摘要
        if (meta.autoSummarize && (meta.hasPrimary || meta.hasBackup)) {
            summarizeConversation(result.id); // fire-and-forget，inFlight 去重
        }

        return { ok: true, id: result.id };
    } catch (e) {
        console.error('[AutoSave] background save error:', e);
        return { ok: false, error: String(e.message || e) };
    }
}

async function testApiKey(plainKey, model) {
    if (!plainKey) return { ok: false, kind: 'no_key' };
    try {
        await self.KBDeepSeek.testConnection({ apiKey: plainKey, model: model || 'deepseek-chat' });
        return { ok: true };
    } catch (err) {
        return { ok: false, kind: (err && err.kind) || 'unknown', message: String(err && err.message || err) };
    }
}

async function distillConversations(cardId, sourceIds) {
    if (distillInFlight.has(cardId)) return { ok: false, kind: 'busy' };
    distillInFlight.add(cardId);
    try {
        const meta = await self.KBSettings.getMeta();
        if (!meta.hasPrimary && !meta.hasBackup) {
            await self.KBRepo.updateKnowledgeCard(cardId, { status: 'failed', errorKind: 'no_key' });
            broadcast('kdCardUpdated', { id: cardId, status: 'failed', kind: 'no_key' });
            return { ok: false, kind: 'no_key' };
        }

        await self.KBRepo.updateKnowledgeCard(cardId, { status: 'pending', errorKind: '' });
        broadcast('kdCardUpdated', { id: cardId, status: 'pending' });

        const active = await self.KBSettings.getActiveKey();
        if (!active || !active.key) {
            await self.KBRepo.updateKnowledgeCard(cardId, { status: 'failed', errorKind: 'no_key' });
            broadcast('kdCardUpdated', { id: cardId, status: 'failed', kind: 'no_key' });
            return { ok: false, kind: 'no_key' };
        }

        const texts = [];
        const sourceTitles = [];
        for (const sid of sourceIds) {
            const conv = await self.KBRepo.getConversation(sid);
            if (!conv) continue;
            const msgs = await self.KBRepo.getMessages(sid);
            sourceTitles.push(conv.title || 'Untitled');
            texts.push(buildConversationText(conv, msgs));
        }

        if (texts.length === 0) {
            await self.KBRepo.updateKnowledgeCard(cardId, { status: 'failed', errorKind: 'empty' });
            broadcast('kdCardUpdated', { id: cardId, status: 'failed', kind: 'empty' });
            return { ok: false, kind: 'empty' };
        }

        try {
            const result = await self.KBDeepSeek.distill(texts, { apiKey: active.key, model: meta.model });
            if (result.usage) {
                await self.KBSettings.bumpUsage(result.usage);
            }
            await self.KBRepo.updateKnowledgeCard(cardId, {
                title: result.title,
                article: result.article,
                summary: result.summary,
                tags: result.tags,
                sourceTitles: sourceTitles,
                status: 'ready',
                errorKind: '',
            });
            broadcast('kdCardUpdated', { id: cardId, status: 'ready' });
            broadcast('kdUpdated');
            return { ok: true };
        } catch (err) {
            const kind = (err && err.kind) || 'unknown';
            await self.KBRepo.updateKnowledgeCard(cardId, { status: 'failed', errorKind: kind });
            broadcast('kdCardUpdated', { id: cardId, status: 'failed', kind });
            return { ok: false, kind, message: String(err && err.message || err) };
        }
    } finally {
        distillInFlight.delete(cardId);
    }
}

async function extractWorkflowConversations(wfId, sourceIds) {
    if (workflowInFlight.has(wfId)) return { ok: false, kind: 'busy' };
    workflowInFlight.add(wfId);
    try {
        const meta = await self.KBSettings.getMeta();
        if (!meta.hasPrimary && !meta.hasBackup) {
            await self.KBRepo.updateWorkflow(wfId, { status: 'failed', errorKind: 'no_key' });
            broadcast('kwfCardUpdated', { id: wfId, status: 'failed', kind: 'no_key' });
            return { ok: false, kind: 'no_key' };
        }

        await self.KBRepo.updateWorkflow(wfId, { status: 'pending', errorKind: '' });
        broadcast('kwfCardUpdated', { id: wfId, status: 'pending' });

        const active = await self.KBSettings.getActiveKey();
        if (!active || !active.key) {
            await self.KBRepo.updateWorkflow(wfId, { status: 'failed', errorKind: 'no_key' });
            broadcast('kwfCardUpdated', { id: wfId, status: 'failed', kind: 'no_key' });
            return { ok: false, kind: 'no_key' };
        }

        const texts = [];
        const sourceTitles = [];
        for (const sid of sourceIds) {
            const conv = await self.KBRepo.getConversation(sid);
            if (!conv) continue;
            const msgs = await self.KBRepo.getMessages(sid);
            sourceTitles.push(conv.title || 'Untitled');
            texts.push(buildConversationText(conv, msgs));
        }

        if (texts.length === 0) {
            await self.KBRepo.updateWorkflow(wfId, { status: 'failed', errorKind: 'empty' });
            broadcast('kwfCardUpdated', { id: wfId, status: 'failed', kind: 'empty' });
            return { ok: false, kind: 'empty' };
        }

        try {
            const result = await self.KBDeepSeek.extractWorkflow(texts, { apiKey: active.key, model: meta.model });
            if (result.usage) {
                await self.KBSettings.bumpUsage(result.usage);
            }
            await self.KBRepo.updateWorkflow(wfId, {
                title: result.title,
                article: result.article,
                summary: result.summary,
                tags: result.tags,
                sourceTitles: sourceTitles,
                status: 'ready',
                errorKind: '',
            });
            broadcast('kwfCardUpdated', { id: wfId, status: 'ready' });
            broadcast('kwfUpdated');
            return { ok: true };
        } catch (err) {
            const kind = (err && err.kind) || 'unknown';
            await self.KBRepo.updateWorkflow(wfId, { status: 'failed', errorKind: kind });
            broadcast('kwfCardUpdated', { id: wfId, status: 'failed', kind });
            return { ok: false, kind, message: String(err && err.message || err) };
        }
    } finally {
        workflowInFlight.delete(wfId);
    }
}

// ----- 消息总线 -----
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (!req || !req.action) return false;

    if (req.action === 'trackEvent') {
        self.GA4.track(req.name, req.params);
        return false;
    }
    if (req.action === 'openSidePanel') {
        chrome.storage.local.set({ pendingOpenConvId: req.convId });
        if (sender.tab && sender.tab.windowId) {
            chrome.sidePanel.open({ windowId: sender.tab.windowId });
        }
        return false;
    }
    if (req.action === 'summarizeConv') {
        summarizeConversation(req.id).then((r) => sendResponse(r));
        return true;
    }
    if (req.action === 'testApiKey') {
        testApiKey(req.apiKey, req.model).then((r) => sendResponse(r));
        return true;
    }
    if (req.action === 'kbUpdated' || req.action === 'kbSummaryUpdated') {
        // popup 触发的入库后通知，Service Worker 不必处理
        return false;
    }
    if (req.action === 'autoSaveConv') {
        handleAutoSave(req.data).then((r) => sendResponse(r));
        return true;
    }
    if (req.action === 'deleteConv') {
        self.KBRepo.deleteConversation(req.id).then(() => {
            broadcast('kbUpdated');
            sendResponse({ ok: true });
        }).catch(() => sendResponse({ ok: false }));
        return true;
    }
    if (req.action === 'generateRecallTitle') {
        self.KBSettings.getActiveKey().then((active) => {
            if (!active || !active.key) return sendResponse({ ok: false, kind: 'no_key' });
            return self.KBDeepSeek.generateTitle(req.question, { apiKey: active.key, model: req.model })
                .then((r) => sendResponse({ ok: true, title: r.title }))
                .catch((err) => sendResponse({ ok: false, kind: (err && err.kind) || 'unknown' }));
        });
        return true;
    }
    if (req.action === 'saveRecallConv') {
        self.KBRepo.saveRecallConv(req.data).then((r) => sendResponse({ ok: true, id: r.id }))
            .catch(() => sendResponse({ ok: false }));
        return true;
    }
    if (req.action === 'deleteRecallConv') {
        self.KBRepo.deleteRecallConv(req.id).then(() => sendResponse({ ok: true }))
            .catch(() => sendResponse({ ok: false }));
        return true;
    }
    if (req.action === 'listRecallConvs') {
        self.KBRepo.listRecallConvs().then((list) => sendResponse({ ok: true, list }))
            .catch(() => sendResponse({ ok: false, list: [] }));
        return true;
    }
    if (req.action === 'distillConversations') {
        distillConversations(req.cardId, req.sourceIds).then((r) => sendResponse(r));
        return true;
    }
    if (req.action === 'deleteKnowledgeCard') {
        self.KBRepo.deleteKnowledgeCard(req.id).then(() => {
            broadcast('kdUpdated');
            sendResponse({ ok: true });
        }).catch(() => sendResponse({ ok: false }));
        return true;
    }
    if (req.action === 'extractWorkflow') {
        extractWorkflowConversations(req.wfId, req.sourceIds).then((r) => sendResponse(r));
        return true;
    }
    if (req.action === 'deleteWorkflow') {
        self.KBRepo.deleteWorkflow(req.id).then(() => {
            broadcast('kwfUpdated');
            sendResponse({ ok: true });
        }).catch(() => sendResponse({ ok: false }));
        return true;
    }
    if (req.action === 'kdUpdated' || req.action === 'kdCardUpdated') {
        return false;
    }
    if (req.action === 'kwfUpdated' || req.action === 'kwfCardUpdated') {
        return false;
    }
    return false;
});

// ----- 流式召回（Port 长连接） -----
chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'recallStream') return;

    port.onMessage.addListener(async (msg) => {
        if (msg.action !== 'recallQuery') return;

        const query = (msg.query || '').trim();
        if (!query) {
            port.postMessage({ type: 'error', kind: 'empty_query' });
            port.disconnect();
            return;
        }

        const history = msg.history || [];

        // 1. 检查 API Key
        const active = await self.KBSettings.getActiveKey();
        if (!active || !active.key) {
            port.postMessage({ type: 'error', kind: 'no_key' });
            port.disconnect();
            return;
        }

        // 2. 构建知识库上下文（每轮都发送，防止 AI 追问时丢失上下文编造内容）
        const result = await self.KBRepo.buildRecallContext(28000);
        const context = result.context;
        const convMap = Object.fromEntries(result.convMap);

        if (!context) {
            port.postMessage({ type: 'error', kind: 'empty_kb' });
            port.disconnect();
            return;
        }

        // 发送 convMap 给 UI
        port.postMessage({ type: 'convMap', data: convMap });

        // 3. 构建 payload 并流式调用
        const meta = await self.KBSettings.getMeta();
        const payload = self.KBPrompts.buildRecallPayload(query, context, meta.model, history);
        const abortController = new AbortController();
        port.onDisconnect.addListener(() => abortController.abort());

        try {
            let usage = null;
            for await (const chunk of self.KBDeepSeek.recallStream(payload, {
                apiKey: active.key,
                model: meta.model,
                signal: abortController.signal,
            })) {
                if (typeof chunk === 'object' && chunk.usage) {
                    usage = chunk.usage;
                } else {
                    port.postMessage({ type: 'chunk', text: chunk });
                }
            }
            if (usage) await self.KBSettings.bumpUsage(usage);
            port.postMessage({ type: 'done' });
        } catch (err) {
            const kind = (err && err.kind) || 'unknown';
            port.postMessage({ type: 'error', kind, message: String(err && err.message || err) });
        }

        port.disconnect();
    });
});
