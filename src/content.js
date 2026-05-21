// =====================
// 配置
// =====================
const config = {
    // mainPageSelector: '.cb86951c', // 主页面
    chatContainerSelector: '.ds-virtual-list-visible-items',  // 聊天框容器

    userClassPrefix: '_9663006',             // 用户消息 class 前缀

    aiClassPrefix: '_4f9bf79',           // AI消息相关 class 前缀

    aiChainOfThought: '._48edb25',        // AI的思维链, 包含"已深度思考xxx秒"和"思考过程"
    searchHintSelector: '._58a6d71._19db599', // 搜索/思考时间, "已深度思考xxx秒"
    thinkingChainSelector: '.e1675d8b',  // 思考链, "思考过程"

    userSessionTitleSelector: '.afa34042',    // 用户会话标题
    finalAnswerSelector: '.ds-assistant-message-main-content',  // ✅ 也可以
    isExportChainOfThought: false,        // 是否导出思考链
    isExportBusyServerMessages: false,    // 是否导出繁忙消息，默认不导出

    // 用户消息内部结构（用于剔除附件 / 操作按钮等噪声）
    userTextSelector: '.fbb737a4',          // 用户提问文本块
    attachmentItemSelector: '._789aea7',    // 单个附件项容器（含文件名 + 元信息）
    attachmentNameSelector: '.f3a54b52',    // 附件文件名
    attachmentMetaSelector: '._5119742',    // 附件元信息（例如 "PNG 13.96KB"）
    userActionBarSelector: '._11d6b3a',     // 用户消息下方操作按钮（复制 / 编辑）
    userAttachmentIconSelector: '.b3a5d6c1', // 附件文件类型 SVG 图标容器
    codeLangSelector: '.d813de27',          // 代码块语言标识（新版 DOM）
};

function initConfig() {
    config.isExportChainOfThought = false;
    config.isExportBusyServerMessages = false;
}

// =====================
// 工具函数
// =====================
function isUserMessage(node) {
    return node.classList.contains(config.userClassPrefix);
}

function isAIMessage(node) {
    return node.classList.contains(config.aiClassPrefix);
}

function getUserSessionTitle() {
    const thinkingNode = document.querySelector(config.userSessionTitleSelector);
    return thinkingNode ? `${thinkingNode.textContent.trim()}` : 'DeepSeek_Chat_Export';
}

// 已深度思考xxx秒
function extractSearchOrThinking(node) {
    const hintNode = node.querySelector(config.searchHintSelector);
    return hintNode ? `**${hintNode.textContent.trim()}**` : null;
}

// 思考过程
function extractThinkingChain(node) {
    const thinkingNode = node.querySelector(config.thinkingChainSelector);
    const elements = thinkingNode.querySelectorAll('p');
    output = '';
    elements.forEach((element) => {
        if (element.textContent.trim() != '') {
            output += `> ${element.textContent.trim()}\n`;
        } else {
            output += '> \n';
        }
    });
    return thinkingNode ? output : null;
}

// 用户消息：抽取附件描述 + 提问文本，过滤 SVG/操作按钮等噪声
function extractUserMessageContent(node) {
    const parts = [];

    // 1. 附件 → [文件名 元信息]
    const attachments = node.querySelectorAll(config.attachmentItemSelector);
    attachments.forEach((att) => {
        const nameEl = att.querySelector(config.attachmentNameSelector);
        const metaEl = att.querySelector(config.attachmentMetaSelector);
        const name = nameEl ? nameEl.textContent.trim() : '';
        const meta = metaEl ? metaEl.textContent.trim() : '';
        if (!name && !meta) return;
        parts.push('[' + [name, meta].filter(Boolean).join(' ') + ']');
    });

    // 2. 主体文本块
    const textEl = node.querySelector(config.userTextSelector);
    if (textEl) {
        const txt = textEl.textContent.trim();
        if (txt) parts.push(txt);
        return parts.join('\n').trim();
    }

    // 3. 没拿到主文本块时降级：克隆节点剥离已知噪声后再 textContent
    const clone = node.cloneNode(true);
    const noisySelectors = [
        config.attachmentItemSelector,
        config.userActionBarSelector,
        config.userAttachmentIconSelector,
        'svg',
    ];
    noisySelectors.forEach((sel) => {
        clone.querySelectorAll(sel).forEach((n) => n.remove());
    });
    const fallback = clone.textContent.trim();
    if (fallback) parts.push(fallback);
    return parts.join('\n').trim();
}

// 下载markdown内容
function downloadMarkdown(markdown, title) {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title + '.md';
    a.click();
}

// 下载PDF内容
function downloadPDF(pdf) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(pdf);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
}

// 提取AI回答的内容
function resolveTag_text(node) {
    let content = '';
    node.childNodes.forEach((childNode) => {
        if (childNode.nodeType === Node.TEXT_NODE) {
            content += childNode.textContent.trim();
        }
        else if (childNode.tagName === 'P') {
            if (childNode.childNodes.length > 1) {
                content += resolveTag_text(childNode)
            } else {
                content += childNode.textContent.trim();
            }
        }
        else if (childNode.tagName === 'STRONG') {
            if (childNode.childNodes.length > 1) {
                content += resolveTag_text(childNode)
            } else {
                content += `**${childNode.textContent.trim()}**`;
            }
        }
        else if (childNode.tagName === 'CODE') {
            content += `\`${childNode.textContent.trim()}\``;
        }
        else if (childNode.tagName === 'EM') {
            content += `*${childNode.textContent.trim()}*`;
        }
        else if (childNode.tagName === 'A') {
            const href = childNode.getAttribute('href');
            content += `[${childNode.textContent.trim()}](${href})`;
        }
        else if (childNode.tagName === 'BR') {
            content += '\n';
        }
        else if (childNode.tagName === 'IMG') {
            const src = childNode.getAttribute('src');
            content += `![${childNode.getAttribute('alt')}](${src})`;
        }
        else if (childNode.tagName === 'SPAN' && childNode.classList.contains('ds-markdown-cite')) {
            content += '';
        }
        else if (childNode.classList && childNode.classList.contains('katex')) {
            const tex = childNode.querySelector('annotation[encoding="application/x-tex"]');
            if (tex) {
                content += `$${tex.textContent.trim()}$`;
            }
        }
        else if (childNode.nodeType === Node.ELEMENT_NODE) {
            content += childNode.textContent.trim();
        }
    });
    return content;
}

function resolveTag_pre(preElement, language = 'python') {
    // 1. 提取 <pre> 中的文本内容
    const codeContent = preElement.textContent || preElement.innerText;

    // 2. 格式化为 Markdown 代码块
    const markdownCodeBlock = `\`\`\`\`${language}\n${codeContent}\n\`\`\`\``;

    return markdownCodeBlock;
}

// 从 .md-code-block 节点中提取语言名，新旧 DOM 都兼容；找不到时返回空串
function getCodeLanguage(blockEl) {
    if (!blockEl) return '';
    const candidates = [
        config.codeLangSelector,    // 新版：.d813de27
        '.md-code-block-infostring' // 老版回退
    ];
    for (const sel of candidates) {
        const el = blockEl.querySelector(sel);
        if (el) {
            const txt = (el.textContent || '').trim();
            if (txt) return txt;
        }
    }
    return '';
}

function resolveTag_table(tableElement) {
    let markdown = '';

    // 1. 处理表头
    const headerRow = tableElement.querySelector('thead tr');
    if (headerRow) {
        const headers = Array.from(headerRow.querySelectorAll('th')).map(
            (th) => th.textContent.trim()
        );
        markdown += `| ${headers.join(' | ')} |\n`; // 表头行
        markdown += `| ${headers.map(() => '---').join(' | ')} |\n`; // 分隔行
    }

    // 2. 处理表格内容
    const bodyRows = tableElement.querySelectorAll('tbody tr');
    bodyRows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll('td')).map((td) =>
            td.textContent.trim()
        );
        markdown += `| ${cells.join(' | ')} |\n`; // 数据行
    });

    return markdown.trim(); // 去除末尾换行
}

function resolveTag_ul_li(node) {
    let markdown = '';

    // 递归处理子节点
    function processNode(element, depth = 0) {
        // 用于存储最终的 Markdown 内容
        let markdown = '';

        // UL 标签
        if (element.tagName === 'UL') {
            // 遍历 <ul> 或 <ol> 的子元素
            for (let child of element.children) {
                if (child.tagName === 'LI') {
                    // 获取当前层级的缩进空格
                    let indent = ' '.repeat(depth * 4);
                    // 获取 <li> 内的文本内容
                    child.childNodes.forEach((childNode) => {
                        if (childNode.nodeType !== Node.ELEMENT_NODE) return;
                        if (childNode.tagName === 'P') {
                            markdown += `${indent}- ${resolveTag_text(childNode)}\n`;
                        }
                        else if (childNode.classList && childNode.classList.contains('md-code-block')) {
                            const pre = childNode.querySelector('pre');
                            if (!pre) return;
                            codeblock = resolveTag_pre(pre, getCodeLanguage(childNode));
                            codeblock = codeblock.replaceAll('\n', `\n${indent}`);
                            markdown += `${indent}${codeblock}\n`;
                        }
                    });

                    let nestedList = child.querySelector('ul, ol');
                    if (nestedList) {
                        markdown += processNode(nestedList, depth + 1);
                    }
                }
            }
        }
        else if (element.tagName === 'OL') {
            // 遍历 <ul> 或 <ol> 的子元素
            for (let child of element.children) {
                if (child.tagName === 'LI') {
                    // 获取当前层级的缩进空格
                    let indent = ' '.repeat(depth * 4);
                    // 获取 <li> 内的文本内容
                    child.childNodes.forEach((childNode) => {
                        if (childNode.nodeType !== Node.ELEMENT_NODE) return;
                        if (childNode.tagName === 'P') {
                            markdown += `${indent}1. ${resolveTag_text(childNode)}\n`;
                        }
                        else if (childNode.classList && childNode.classList.contains('md-code-block')) {
                            const pre = childNode.querySelector('pre');
                            if (!pre) return;
                            codeblock = resolveTag_pre(pre, getCodeLanguage(childNode));
                            codeblock = codeblock.replaceAll('\n', `\n${indent}`);
                            markdown += `${indent}${codeblock}\n`;
                        }
                    });

                    let nestedList = child.querySelector('ul, ol');
                    if (nestedList) {
                        markdown += processNode(nestedList, depth + 1);
                    }
                }
            }
        }
        return markdown;
    }
    // 开始处理根节点
    markdown = processNode(node);
    return markdown.trim(); // 去除首尾空白
}

function extractFinalAnswer(node) {
    const answerNode = node.querySelector(config.finalAnswerSelector);
    if (!answerNode) return null;

    let answerContent = '';
    const elements = answerNode.querySelectorAll('.ds-assistant-message-main-content>.md-code-block, \
        .ds-assistant-message-main-content>p,\
        .ds-assistant-message-main-content>h1, \
        .ds-assistant-message-main-content>h2,\
        .ds-assistant-message-main-content>h3, \
        .ds-assistant-message-main-content>h4, \
        .ds-assistant-message-main-content>h5, \
        .ds-assistant-message-main-content>blockquote,\
        .ds-assistant-message-main-content>ol,\
        .ds-assistant-message-main-content>ul,\
        .ds-assistant-message-main-content>table,\
        .katex-display.ds-markdown-math, \
        hr');

    elements.forEach((element) => {
        if (element.tagName.toLowerCase() === 'p') {
            answerContent += resolveTag_text(element);
            answerContent += '\n\n';
        }
        else if (element.tagName.toLowerCase() === 'h1') {
            answerContent += `# ${resolveTag_text(element)}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'h2') {
            answerContent += `## ${resolveTag_text(element)}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'h3') {

            answerContent += `### ${resolveTag_text(element)}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'h4') {
            answerContent += `#### ${resolveTag_text(element)}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'h5') {
            answerContent += `##### ${resolveTag_text(element)}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'hr') {
            answerContent += '\n---\n';
        }
        else if (element.tagName.toLowerCase() === 'blockquote') {
            answerContent += `> ${resolveTag_text(element.querySelector('p'))}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'ul' || element.tagName.toLowerCase() === 'ol') {
            answerContent += `${resolveTag_ul_li(element)}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'table') {
            answerContent += `${resolveTag_table(element)}\n\n`;
        }
        else if (element.classList.contains('katex-display')) {
            const tex = element.querySelector('annotation[encoding="application/x-tex"]');
            if (tex) {
                answerContent += `$${tex.textContent.trim()}$\n\n`;
            }
        }
        else if (element.classList.contains('md-code-block')) {
            const pre = element.querySelector('pre');
            if (pre) {
                codeblock = resolveTag_pre(pre, getCodeLanguage(element));
                answerContent += `${codeblock}\n\n`;
            }
        }
    });

    return `${answerContent.trim()}`;
}

function getFilteredContainer() {
    const chatContainer = document.querySelector(config.chatContainerSelector);
    if (!chatContainer) {
        console.error('未找到聊天容器');
        return messages;
    }
    for (const node of chatContainer.children) {
        if (isAIMessage(node)) {
            const thinkingChainNode = node.querySelector(`${config.aiChainOfThought}`);

            if (!config.isExportChainOfThought && thinkingChainNode && node.contains(thinkingChainNode)) {
                node.removeChild(thinkingChainNode);
            }
        }
    }
    return chatContainer;
}

function getOrderedMessages() {
    const messages = [];
    const chatContainer = document.querySelector(config.chatContainerSelector);
    if (!chatContainer) {
        console.error('未找到聊天容器');
        return messages;
    }

    for (const node of chatContainer.children) {
        if (isUserMessage(node)) {
            // 用户消息
            const userMessage = `# 用户：\n\n${extractUserMessageContent(node)}`;

            const nextNode = node.nextElementSibling;
            if (nextNode && isAIMessage(nextNode)) {
                const finalAnswer = extractFinalAnswer(nextNode);
                if (finalAnswer && finalAnswer.includes("服务器繁忙，请稍后再试。") && !config.isExportBusyServerMessages) {
                    continue; // 跳过当前用户消息
                }
            }
            messages.push(userMessage);
        } else if (isAIMessage(node)) {
            // AI 消息
            let output = '';
            const aiChainOfThought = node.querySelector(`${config.aiChainOfThought}`);
            if (aiChainOfThought && config.isExportChainOfThought) {
                // 已深度思考xxx秒
                const searchHint = extractSearchOrThinking(aiChainOfThought);
                if (searchHint) output += `> ${searchHint}\n> \n`;
                // 思考过程
                const thinkingChain = extractThinkingChain(aiChainOfThought);
                if (thinkingChain) output += `${thinkingChain}\n`;
            } else {
                const searchHint = extractSearchOrThinking(node);
                if (searchHint) output += `${searchHint}\n`;
            }
            const finalAnswer = extractFinalAnswer(node);
            if (finalAnswer && finalAnswer.includes("服务器繁忙，请稍后再试。") && !config.isExportBusyServerMessages) {
                continue; // 跳过当前AI消息
            }
            if (finalAnswer) output = `# DeepSeek：\n${output}\n**原始回答**\n\n${finalAnswer}\n\n`;
            if (output.trim()) {
                messages.push(output.trim());
            }
        }
    }
    return messages;
}

function generateMdContent(messages = '') {
    if (!messages) {
        messages = getOrderedMessages();
    }
    return messages.length ? messages.join('\n\n') : '';
}

// =====================
// 结构化抽取（用于知识库入库）
// =====================
function getStructuredMessages() {
    const result = [];
    const chatContainer = document.querySelector(config.chatContainerSelector);
    if (!chatContainer) return result;

    let idx = 0;
    let pendingUser = null;

    for (const node of chatContainer.children) {
        if (isUserMessage(node)) {
            if (pendingUser) {
                result.push(pendingUser);
                pendingUser = null;
            }
            pendingUser = {
                idx: idx++,
                role: 'user',
                content: extractUserMessageContent(node),
                thinking: '',
                thinkingHint: '',
            };
        } else if (isAIMessage(node)) {
            const aiChainOfThought = node.querySelector(`${config.aiChainOfThought}`);
            let thinking = '';
            let thinkingHint = '';
            if (aiChainOfThought) {
                const hint = extractSearchOrThinking(aiChainOfThought);
                if (hint) thinkingHint = hint.replace(/\*\*/g, '');
                try {
                    const chain = extractThinkingChain(aiChainOfThought);
                    if (chain) thinking = chain;
                } catch (_) { /* 思考链可能缺失，忽略 */ }
            } else {
                const hint = extractSearchOrThinking(node);
                if (hint) thinkingHint = hint.replace(/\*\*/g, '');
            }

            // 抽取最终回答前先临时移除思维链节点，避免污染
            let removedNode = null;
            let parentNode = null;
            if (aiChainOfThought && node.contains(aiChainOfThought)) {
                parentNode = aiChainOfThought.parentNode;
                removedNode = parentNode.removeChild(aiChainOfThought);
            }
            const finalAnswer = extractFinalAnswer(node);
            if (removedNode && parentNode) {
                parentNode.appendChild(removedNode);
            }

            if (pendingUser) {
                result.push(pendingUser);
                pendingUser = null;
            }
            if (finalAnswer && finalAnswer.includes('服务器繁忙，请稍后再试。')) {
                continue;
            }
            if (finalAnswer) {
                result.push({
                    idx: idx++,
                    role: 'assistant',
                    content: finalAnswer,
                    thinking,
                    thinkingHint,
                });
            }
        }
    }
    if (pendingUser) result.push(pendingUser);
    return result;
}

function extractStructuredConversation() {
    return {
        title: getUserSessionTitle(),
        url: location.href,
        createdAt: Date.now(),
        messages: getStructuredMessages(),
    };
}

// =====================
// 缓存优先 + HTML 兜底
// =====================
async function loadCachedForCurrentSession() {
    try {
        if (typeof PageCache === 'undefined') return null;
        const sid = PageCache.getSessionIdFromUrl(location.href);
        if (!sid) return null;
        return await PageCache.loadCachedConversation(sid);
    } catch (_) {
        return null;
    }
}

// 生成消息指纹：role + 前 200 字符（去空白），对 PageCache vs DOM 的格式差异容错
function messageKey(m) {
    const norm = (m.content || '').replace(/\s+/g, '').slice(0, 200);
    return m.role + '|' + norm;
}

// 位置优先的合并策略：在 DOM 中定位 cache 最后一条的位置，只追加其之后的新消息
function mergeMessages(cacheArr, domArr, keyFn) {
    if (!cacheArr.length) return domArr;
    if (!domArr.length) return cacheArr;

    const lastCacheKey = keyFn(cacheArr[cacheArr.length - 1]);
    const domKeys = domArr.map(keyFn);

    // 1. cache 最后一条在 DOM 中的位置
    const lastIdx = domKeys.lastIndexOf(lastCacheKey);
    if (lastIdx >= 0) {
        // DOM 已包含 cache 最后一条 → 只取 DOM 中它之后的新消息
        const newMsgs = domArr.slice(lastIdx + 1);
        return newMsgs.length ? cacheArr.concat(newMsgs) : cacheArr;
    }

    // 2. cache 最后一条不在 DOM → 检查 DOM 是否在展示旧内容（用户回滚）
    const firstDomKey = domKeys[0];
    const cacheKeySet = new Set(cacheArr.map(keyFn));
    if (cacheKeySet.has(firstDomKey)) {
        // DOM 首条是旧消息 → 用户回滚，以 cache 为准
        return cacheArr;
    }

    // 3. DOM 全是新消息 → 拼接
    return cacheArr.concat(domArr);
}

async function getOrderedMessagesMerged() {
    const cached = await loadCachedForCurrentSession();
    const cachedList = cached ? PageCache.cachedToOrderedMessages(cached, config) : [];
    const domList = getOrderedMessages();
    return mergeMessages(cachedList, domList, (s) => (s || '').replace(/\s+/g, '').slice(0, 200));
}

async function getStructuredMessagesMerged() {
    const cached = await loadCachedForCurrentSession();
    const cachedList = cached ? PageCache.cachedToStructuredMessages(cached, config) : [];
    const domList = getStructuredMessages();
    const merged = mergeMessages(cachedList, domList, messageKey);
    // 重排 idx 保持递增
    return merged.map((m, i) => ({ ...m, idx: i }));
}

async function extractStructuredConversationMerged() {
    return {
        title: getUserSessionTitle(),
        url: location.href,
        createdAt: Date.now(),
        messages: await getStructuredMessagesMerged(),
    };
}

// =====================
// 导出功能
// =====================
async function exportMarkdown() {
    const messages = await getOrderedMessagesMerged();
    const mdContent = generateMdContent(messages);
    if (!mdContent) {
        alert("未找到聊天记录！");
        return;
    }
    return mdContent;
}

// TODO
async function exportPDF() {
    const messages = await getOrderedMessagesMerged();
    const mdContent = generateMdContent(messages);
    if (!mdContent) {
        alert("未找到聊天记录！");
        return;
    }

    fixedMdContent = marked.parse(mdContent)
    const printContent = `
            <html>
                <head>
                    <title>${getUserSessionTitle()}</title>
                    <style>
                    body {
                        font: 12px 'Arial', sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    pre {
                        background-color: #f4f4f4;
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                        font-family: 'Courier New', Consolas, Courier, monospace;
                    }

                    blockquote {
                        border-left: 4px solid #ccc;
                        margin: 1em 0;
                        padding-left: 1em;
                        color: #555;
                        font-style: italic;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    th, td {
                        padding: 8px;
                        text-align: left;
                    }

                    thead {
                        border-bottom: 1px solid #000;
                    }

                    tbody tr:nth-child(even) {
                    background-color: #f9f9f9;
                    }

                    tfoot {
                    border-top: 3px solid #000;
                    }

                    </style>
                </head>
                <body>
                    ${fixedMdContent}
                </body>
            </html>
        `;
    return printContent;
}

function exportImage() {
    let chatContainer = document.querySelector(config.chatContainerSelector);
    if (!chatContainer) {
        console.error('未找到聊天容器');
    }
    chatContainer = getFilteredContainer();
    html2canvas(chatContainer).then(function (canvas) {
        Canvas2Image.saveAsPNG(canvas, canvas.width, canvas.height, getUserSessionTitle());
    });
}


// ===================== 自动保存到知识库 =====================
(function () {
    const AUTOSAVE_DEBOUNCE_MS = 2000;
    const REOBSERVE_INTERVAL_MS = 30000;

    let autoSaveEnabled = true;
    let debounceTimer = null;
    let lastSavedUrl = '';
    let lastMessageCount = 0;
    let observer = null;
    let observedContainer = null;

    // --- Filter 管道（扩展点） ---
    // 每个 filter: async (conversationData) => boolean
    // 返回 true 允许保存，false 跳过。顺序执行，首个 false 阻断。
    const AutoSaveFilters = [];

    async function runFilters(data) {
        for (const filter of AutoSaveFilters) {
            try {
                if (!(await filter(data))) return false;
            } catch (e) {
                console.error('[AutoSave] filter error:', e);
            }
        }
        return true;
    }

    window.DeepSeekAutoSave = {
        addFilter(fn) { AutoSaveFilters.push(fn); },
        removeFilter(fn) {
            const i = AutoSaveFilters.indexOf(fn);
            if (i >= 0) AutoSaveFilters.splice(i, 1);
        },
        isEnabled() { return autoSaveEnabled; },
        flush() { onDebounceComplete(); },
    };

    // --- 设置同步 ---
    function loadAutoSaveSetting() {
        chrome.storage.local.get('kb_settings_v1', (res) => {
            const s = res['kb_settings_v1'] || {};
            autoSaveEnabled = s.autoSave !== false;
            syncObserver();
        });
    }

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes['kb_settings_v1']) {
            const s = changes['kb_settings_v1'].newValue || {};
            autoSaveEnabled = s.autoSave !== false;
            syncObserver();
        }
    });

    // --- MutationObserver ---
    function startObserver() {
        const container = document.querySelector(config.chatContainerSelector);
        if (!container) return;
        if (observer && observedContainer === container) return;

        if (observer) observer.disconnect();

        observer = new MutationObserver(() => {
            if (!autoSaveEnabled) return;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(onDebounceComplete, AUTOSAVE_DEBOUNCE_MS);
        });

        observer.observe(container, { childList: true, subtree: true });
        observedContainer = container;
    }

    function stopObserver() {
        if (observer) { observer.disconnect(); observer = null; }
        observedContainer = null;
        clearTimeout(debounceTimer);
    }

    function syncObserver() {
        if (autoSaveEnabled) startObserver();
        else stopObserver();
    }

    // 等待聊天容器就绪
    function bootstrap() {
        if (!autoSaveEnabled) return;
        const container = document.querySelector(config.chatContainerSelector);
        if (container) {
            startObserver();
            return;
        }
        const bodyObs = new MutationObserver(() => {
            if (document.querySelector(config.chatContainerSelector)) {
                bodyObs.disconnect();
                startObserver();
            }
        });
        bodyObs.observe(document.body, { childList: true, subtree: true });
    }

    // 定期检查容器是否被替换（SPA 导航）
    setInterval(() => {
        if (!autoSaveEnabled) return;
        const container = document.querySelector(config.chatContainerSelector);
        if (container && observedContainer !== container) {
            startObserver();
        }
    }, REOBSERVE_INTERVAL_MS);

    // --- 气泡通知 ---
    const TOAST_DISMISS_MS = 3000;

    // i18n
    const toastI18n = {
        zh: { added: '对话已加入知识库', undo: '撤回', view: '查看', downloading: '开始下载…', downloadFail: '下载失败' },
        en: { added: 'Conversation saved to knowledge base', undo: 'Undo', view: 'View', downloading: 'Downloading…', downloadFail: 'Download failed' },
    };
    let toastLang = 'zh';

    chrome.storage.local.get('language', (res) => { toastLang = res.language || 'zh'; });
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.language) toastLang = changes.language.newValue || 'zh';
    });

    function showToast(text, onUndo, convId) {
        const t = toastI18n[toastLang] || toastI18n.zh;

        // 移除旧气泡
        const old = document.getElementById('ds2md-autosave-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.id = 'ds2md-autosave-toast';
        toast.innerHTML =
            '<div class="ds2md-toast-row">' +
                '<span class="ds2md-toast-text"></span>' +
                '<button class="ds2md-toast-view"></button>' +
                '<button class="ds2md-toast-undo"></button>' +
            '</div>' +
            '<div class="ds2md-toast-watermark">DeepSeek <span>Copilot</span></div>';
        toast.querySelector('.ds2md-toast-text').textContent = text;
        toast.querySelector('.ds2md-toast-view').textContent = t.view;
        toast.querySelector('.ds2md-toast-undo').textContent = t.undo;

        // 注入样式
        if (!document.getElementById('ds2md-autosave-style')) {
            const style = document.createElement('style');
            style.id = 'ds2md-autosave-style';
            style.textContent = `
                #ds2md-autosave-toast {
                    position: fixed; bottom: 32px; right: 32px;
                    background: #fff; color: #1a1a2e; padding: 14px 20px 10px;
                    border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.08);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px; z-index: 2147483647;
                    animation: ds2md-toast-in .3s ease;
                    border: 1px solid rgba(0,0,0,.06);
                }
                @keyframes ds2md-toast-in { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes ds2md-toast-out { to { opacity:0; transform:translateY(16px); } }
                .ds2md-toast-row {
                    display: flex; align-items: center; gap: 10px;
                }
                .ds2md-toast-text {
                    flex: 1; white-space: nowrap;
                }
                .ds2md-toast-view {
                    background: none; border: 1px solid #6c5ce7; color: #6c5ce7;
                    padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;
                    transition: background .15s, color .15s;
                }
                .ds2md-toast-view:hover { background: #6c5ce7; color: #fff; }
                .ds2md-toast-undo {
                    background: none; border: 1px solid rgba(0,0,0,.15); color: #666;
                    padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;
                    transition: background .15s, color .15s;
                }
                .ds2md-toast-undo:hover { background: rgba(0,0,0,.06); color: #333; }
                .ds2md-toast-watermark {
                    text-align: right; font-size: 10px; color: #bbb; margin-top: 6px;
                    letter-spacing: .5px;
                }
                .ds2md-toast-watermark span {
                    background: linear-gradient(90deg, #6c5ce7, #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 600;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        let undone = false;

        toast.querySelector('.ds2md-toast-view').addEventListener('click', () => {
            dismissToast(toast);
            chrome.runtime.sendMessage({ action: 'openSidePanel', convId: convId });
        });

        toast.querySelector('.ds2md-toast-undo').addEventListener('click', () => {
            undone = true;
            dismissToast(toast);
            if (onUndo) onUndo();
        });

        // 自动消失
        setTimeout(() => { if (!undone) dismissToast(toast); }, TOAST_DISMISS_MS);
    }

    function dismissToast(el) {
        if (!el || !el.parentNode) return;
        el.style.animation = 'ds2md-toast-out .25s ease forwards';
        setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
    }

    // --- 防抖回调：提取 + 过滤 + 发送到 background 去重保存 ---
    async function onDebounceComplete() {
        if (!autoSaveEnabled) return;

        try {
            const data = await extractStructuredConversationMerged();

            if (!data.messages || data.messages.length === 0) return;
            if (!data.messages.some(m => m.role === 'assistant')) return;
            if (data.url === lastSavedUrl && data.messages.length === lastMessageCount) return;
            if (!(await runFilters(data))) return;

            // 发送到 background，由 background 的 saveConversation 负责 IDB 去重
            chrome.runtime.sendMessage(
                { action: 'autoSaveConv', data },
                (resp) => {
                    if (chrome.runtime.lastError) return;
                    if (!resp || !resp.ok) return;

                    // 更新快速去重状态
                    lastSavedUrl = data.url;
                    lastMessageCount = data.messages.length;

                    // background 判定为重复（skipped）→ 不弹 toast
                    if (resp.skipped) return;

                    // 新保存 → 弹 toast，撤回 → 删除 + 标记已处理防循环
                    const t = toastI18n[toastLang] || toastI18n.zh;
                    showToast(t.added, () => {
                        chrome.runtime.sendMessage({ action: 'deleteConv', id: resp.id });
                        lastSavedUrl = data.url;
                        lastMessageCount = data.messages.length;
                    }, resp.id);
                }
            );
        } catch (e) {
            console.error('[AutoSave] extract/send error:', e);
        }
    }

    // --- 初始化 ---
    loadAutoSaveSetting();
    bootstrap();
})();


// ===================== 添加chrome消息通信机制 =====================

// 监听来自 popup.js 的消息

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractStructured') {
        (async () => {
            try {
                const data = await extractStructuredConversationMerged();
                sendResponse({ ok: true, data });
            } catch (err) {
                sendResponse({ ok: false, error: String(err && err.message || err) });
            }
        })();
        return true;
    }
    if (request.action === 'updateExportChainOfThoughtState') {
        const switchState = request.state;
        if (switchState) {
            config.isExportChainOfThought = true;
        } else {
            config.isExportChainOfThought = false;
        }
    }
    else if (request.action === 'updateBlockBusyMessagesState') {
        const switchState = request.state;
        if (switchState) {
            config.isExportBusyServerMessages = true;
        } else {
            config.isExportBusyServerMessages = false;
        }
    }
    else if (request.action === 'generateMarkdown') {
        (async () => {
            const markdown = await exportMarkdown();
            if (markdown) downloadMarkdown(markdown, getUserSessionTitle());
            initConfig();
        })();
    }
    else if (request.action === 'generateImage') {
        exportImage();
        initConfig();
    }
    else if (request.action === 'generatePDF') {
        (async () => {
            const pdf = await exportPDF();
            if (pdf) downloadPDF(pdf, getUserSessionTitle());
            initConfig();
        })();
    }
    else if (request.action === 'showNotificationImage') {
        const t = toastI18n[toastLang] || toastI18n.zh;

        if (!document.getElementById('ds2md-dl-style')) {
            const style = document.createElement('style');
            style.id = 'ds2md-dl-style';
            style.textContent = `
                #ds2md-download-toast {
                    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                    display: flex; align-items: center; gap: 8px;
                    background: #fff; color: #1a1a2e; padding: 10px 20px;
                    border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.08);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 13px; z-index: 2147483647;
                    border: 1px solid rgba(0,0,0,.06);
                    animation: ds2md-dl-in .3s ease;
                }
                @keyframes ds2md-dl-in { from { opacity:0; transform:translateX(-50%) translateY(-12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
                @keyframes ds2md-dl-out { to { opacity:0; transform:translateX(-50%) translateY(-12px); } }
                #ds2md-download-toast .ds2md-dl-spinner {
                    width: 14px; height: 14px; border: 2px solid #e0e0e0;
                    border-top-color: #6c5ce7; border-radius: 50%;
                    animation: ds2md-dl-spin .6s linear infinite;
                }
                @keyframes ds2md-dl-spin { to { transform: rotate(360deg); } }
                #ds2md-download-toast .ds2md-dl-icon { font-size: 15px; }
            `;
            document.head.appendChild(style);
        }

        const old = document.getElementById('ds2md-download-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.id = 'ds2md-download-toast';
        toast.innerHTML = '<div class="ds2md-dl-spinner"></div><span>' + t.downloading + '</span>';

        try {
            exportImage();
            document.body.appendChild(toast);
        } catch (error) {
            console.log(error);
            toast.innerHTML = '<span class="ds2md-dl-icon">✕</span><span>' + t.downloadFail + '</span>';
            document.body.appendChild(toast);
        }

        setTimeout(() => {
            if (!toast.parentNode) return;
            toast.style.animation = 'ds2md-dl-out .25s ease forwards';
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 250);
        }, 2000);
    }
    else if (request.action === 'generateBatch') {
        (async () => {
            const messages = await getOrderedMessagesMerged();
            let currentPage = 0;
            const messagesPerPage = 10;

            // i18n
            const i18nBatch = {
                zh: {
                    title: '批量导出',
                    countSuffix: ' 条',
                    countPrefix: '共 ',
                    selPrefix: '已选 ',
                    selSep: ' / ',
                    selectAll: '全选',
                    invert: '反选',
                    clear: '清空',
                    expand: '展开',
                    collapse: '收起',
                    cancel: '取消',
                    exportMd: '导出 Markdown',
                    empty: '当前页面未发现可导出的消息',
                    alertEmpty: '请选择要导出的消息！',
                    titleClose: '关闭',
                    titlePrev: '上一页',
                    titleNext: '下一页',
                },
                en: {
                    title: 'Batch Export',
                    countSuffix: '',
                    countPrefix: 'Total ',
                    selPrefix: 'Selected ',
                    selSep: ' / ',
                    selectAll: 'Select all',
                    invert: 'Invert',
                    clear: 'Clear',
                    expand: 'Expand',
                    collapse: 'Collapse',
                    cancel: 'Cancel',
                    exportMd: 'Export Markdown',
                    empty: 'No exportable messages found on this page',
                    alertEmpty: 'Please select at least one message to export.',
                    titleClose: 'Close',
                    titlePrev: 'Previous',
                    titleNext: 'Next',
                },
            };
            const lang = await new Promise((resolve) => {
                try {
                    chrome.storage.local.get('language', (res) => {
                        resolve((res && res.language === 'en') ? 'en' : 'zh');
                    });
                } catch (_) { resolve('zh'); }
            });
            const tt = i18nBatch[lang];
            let selectedMessages = [];

            // 注入样式（仅一次）
            if (!document.getElementById('dsc-batch-style')) {
                const style = document.createElement('style');
                style.id = 'dsc-batch-style';
                style.textContent = `
                .dsc-modal-overlay { position: fixed; inset: 0; z-index: 10000;
                    background: rgba(15,23,42,.45); display: flex; align-items: center;
                    justify-content: center; padding: 24px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
                    color: #1f2937; animation: dsc-fade .15s ease-out; }
                @keyframes dsc-fade { from { opacity: 0 } to { opacity: 1 } }
                .dsc-modal { width: 100%; max-width: 720px; max-height: calc(100vh - 48px);
                    background: #ffffff; border-radius: 12px; display: flex;
                    flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,.18);
                    overflow: hidden; }
                .dsc-modal-header { display: flex; align-items: center; justify-content: space-between;
                    padding: 14px 18px; border-bottom: 1px solid #eef0f4; }
                .dsc-title { display: flex; align-items: center; gap: 8px; font-size: 15px;
                    font-weight: 600; color: #111827; }
                .dsc-title .ico { font-size: 16px; }
                .dsc-count { font-size: 12px; color: #6b7280; font-weight: 500; }
                .dsc-close { width: 28px; height: 28px; border: none; background: transparent;
                    border-radius: 6px; color: #6b7280; font-size: 18px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; line-height: 1; }
                .dsc-close:hover { background: #f3f4f6; color: #1f2937; }
                .dsc-toolbar { display: flex; align-items: center; gap: 8px;
                    padding: 10px 18px; border-bottom: 1px solid #eef0f4; background: #f9fafb; }
                .dsc-toolbar .spacer { flex: 1; }
                .dsc-chip { display: inline-flex; align-items: center; gap: 6px;
                    padding: 6px 10px; background: #ffffff; color: #1f2937;
                    border: 1px solid #e5e7eb; border-radius: 7px; font-size: 12px;
                    font-weight: 500; cursor: pointer;
                    transition: background-color .15s, border-color .15s; }
                .dsc-chip:hover { background: #f3f4f6; border-color: #d1d5db; }
                .dsc-chip .ico { font-size: 13px; line-height: 1; }
                .dsc-body { flex: 1; overflow-y: auto; padding: 8px 18px; }
                .dsc-row { display: flex; align-items: flex-start; gap: 10px;
                    padding: 10px 8px; border-bottom: 1px solid #eef0f4; }
                .dsc-row:last-child { border-bottom: none; }
                .dsc-row:hover { background: #fafbfc; border-radius: 6px; }
                .dsc-idx { flex-shrink: 0; width: 28px; height: 22px; display: inline-flex;
                    align-items: center; justify-content: center;
                    background: #eef2ff; color: #4338ca; font-size: 11px;
                    font-weight: 600; border-radius: 6px; margin-top: 1px; }
                .dsc-cb { flex-shrink: 0; width: 16px; height: 16px; margin-top: 4px;
                    accent-color: #2563eb; cursor: pointer; }
                .dsc-msg { flex: 1; min-width: 0; font-size: 13px; line-height: 1.55;
                    color: #1f2937; word-break: break-word; cursor: pointer; }
                .dsc-toggle { background: none; border: none; padding: 0; margin-left: 6px;
                    color: #2563eb; font-size: 12px; cursor: pointer; font-weight: 500; }
                .dsc-toggle:hover { text-decoration: underline; }
                .dsc-footer { display: flex; align-items: center; gap: 10px;
                    padding: 12px 18px; border-top: 1px solid #eef0f4; background: #f9fafb; }
                .dsc-pager { display: flex; align-items: center; gap: 6px; font-size: 12px;
                    color: #6b7280; }
                .dsc-pager .dsc-page-info { padding: 0 6px; min-width: 60px; text-align: center; }
                .dsc-btn { display: inline-flex; align-items: center; gap: 6px;
                    padding: 8px 14px; border: 1px solid #e5e7eb; background: #ffffff;
                    color: #1f2937; border-radius: 7px; font-size: 13px; font-weight: 500;
                    cursor: pointer; transition: background-color .15s, border-color .15s; }
                .dsc-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
                .dsc-btn:disabled { opacity: .45; cursor: not-allowed; }
                .dsc-btn.icon-only { padding: 8px 10px; }
                .dsc-btn-primary { background: #2563eb; border-color: #2563eb; color: #fff; }
                .dsc-btn-primary:hover:not(:disabled) { background: #1d4ed8; border-color: #1d4ed8; }
                .dsc-empty { padding: 40px 18px; text-align: center; color: #9ca3af;
                    font-size: 13px; }
                `;
                document.head.appendChild(style);
            }
            // 模态框结构：overlay > modal > [header, toolbar, body, footer]
            const overlay = document.createElement('div');
            overlay.id = 'messageModal';
            overlay.className = 'dsc-modal-overlay';

            const modal = document.createElement('div');
            modal.className = 'dsc-modal';

            const header = document.createElement('div');
            header.className = 'dsc-modal-header';
            const titleWrap = document.createElement('div');
            titleWrap.className = 'dsc-title';
            titleWrap.innerHTML = '<span class="ico">📦</span><span></span>';
            titleWrap.lastElementChild.textContent = tt.title;
            const countSpan = document.createElement('span');
            countSpan.className = 'dsc-count';
            const headerRight = document.createElement('div');
            headerRight.style.display = 'flex';
            headerRight.style.alignItems = 'center';
            headerRight.style.gap = '8px';
            const closeIconBtn = document.createElement('button');
            closeIconBtn.className = 'dsc-close';
            closeIconBtn.title = tt.titleClose;
            closeIconBtn.textContent = '×';
            headerRight.appendChild(countSpan);
            headerRight.appendChild(closeIconBtn);
            header.appendChild(titleWrap);
            header.appendChild(headerRight);

            const toolbar = document.createElement('div');
            toolbar.className = 'dsc-toolbar';
            const selectAllBtn = document.createElement('button');
            selectAllBtn.className = 'dsc-chip';
            selectAllBtn.innerHTML = '<span class="ico">☑️</span><span></span>';
            selectAllBtn.lastElementChild.textContent = tt.selectAll;
            const invertBtn = document.createElement('button');
            invertBtn.className = 'dsc-chip';
            invertBtn.innerHTML = '<span class="ico">🔁</span><span></span>';
            invertBtn.lastElementChild.textContent = tt.invert;
            const clearBtn = document.createElement('button');
            clearBtn.className = 'dsc-chip';
            clearBtn.innerHTML = '<span class="ico">⬜</span><span></span>';
            clearBtn.lastElementChild.textContent = tt.clear;
            const selInfo = document.createElement('span');
            selInfo.className = 'dsc-count';
            toolbar.appendChild(selectAllBtn);
            toolbar.appendChild(invertBtn);
            toolbar.appendChild(clearBtn);
            const spacer = document.createElement('div');
            spacer.className = 'spacer';
            toolbar.appendChild(spacer);
            toolbar.appendChild(selInfo);

            const body = document.createElement('div');
            body.className = 'dsc-body';

            const footer = document.createElement('div');
            footer.className = 'dsc-footer';
            const pager = document.createElement('div');
            pager.className = 'dsc-pager';
            const prevBtn = document.createElement('button');
            prevBtn.className = 'dsc-btn icon-only';
            prevBtn.title = tt.titlePrev;
            prevBtn.textContent = '‹';
            const pageInfo = document.createElement('span');
            pageInfo.className = 'dsc-page-info';
            const nextBtn = document.createElement('button');
            nextBtn.className = 'dsc-btn icon-only';
            nextBtn.title = tt.titleNext;
            nextBtn.textContent = '›';
            pager.appendChild(prevBtn);
            pager.appendChild(pageInfo);
            pager.appendChild(nextBtn);

            const footerSpacer = document.createElement('div');
            footerSpacer.style.flex = '1';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'dsc-btn';
            cancelBtn.textContent = tt.cancel;

            const exportBtn = document.createElement('button');
            exportBtn.className = 'dsc-btn dsc-btn-primary';
            exportBtn.innerHTML = '<span>📄</span><span></span>';
            exportBtn.lastElementChild.textContent = tt.exportMd;

            footer.appendChild(pager);
            footer.appendChild(footerSpacer);
            footer.appendChild(cancelBtn);
            footer.appendChild(exportBtn);

            modal.appendChild(header);
            modal.appendChild(toolbar);
            modal.appendChild(body);
            modal.appendChild(footer);
            overlay.appendChild(modal);

            const totalPages = Math.max(1, Math.ceil(messages.length / messagesPerPage));
            countSpan.textContent = tt.countPrefix + messages.length + tt.countSuffix;

            function updateSelInfo() {
                selInfo.textContent = tt.selPrefix + selectedMessages.length + tt.selSep + messages.length;
            }
            updateSelInfo();

            function renderMessages(page) {
                body.innerHTML = '';
                if (messages.length === 0) {
                    const empty = document.createElement('div');
                    empty.className = 'dsc-empty';
                    empty.textContent = tt.empty;
                    body.appendChild(empty);
                    return;
                }
                const start = page * messagesPerPage;
                const end = Math.min(start + messagesPerPage, messages.length);
                const pageMessages = messages.slice(start, end);

                pageMessages.forEach((message, i) => {
                    const idx = start + i;
                    const row = document.createElement('div');
                    row.className = 'dsc-row';

                    const idxBadge = document.createElement('span');
                    idxBadge.className = 'dsc-idx';
                    idxBadge.textContent = idx + 1;

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'dsc-cb';
                    checkbox.id = 'message_' + idx;
                    checkbox.checked = selectedMessages.includes(message);
                    checkbox.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            if (!selectedMessages.includes(message)) selectedMessages.push(message);
                        } else {
                            selectedMessages = selectedMessages.filter(m => m !== message);
                        }
                        updateSelInfo();
                    });

                    const msgWrap = document.createElement('div');
                    msgWrap.className = 'dsc-msg';
                    const COLLAPSED = 150;
                    const isLong = message.length > COLLAPSED;
                    const label = document.createElement('span');
                    label.textContent = isLong ? message.substring(0, COLLAPSED) + '...' : message;
                    msgWrap.appendChild(label);

                    msgWrap.addEventListener('click', (e) => {
                        if (e.target.tagName === 'BUTTON') return;
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    });

                    if (isLong) {
                        const toggleBtn = document.createElement('button');
                        toggleBtn.className = 'dsc-toggle';
                        toggleBtn.textContent = tt.expand;
                        let expanded = false;
                        toggleBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            expanded = !expanded;
                            if (expanded) {
                                label.textContent = message;
                                toggleBtn.textContent = tt.collapse;
                            } else {
                                label.textContent = message.substring(0, COLLAPSED) + '...';
                                toggleBtn.textContent = tt.expand;
                            }
                        });
                        msgWrap.appendChild(toggleBtn);
                    }

                    row.appendChild(idxBadge);
                    row.appendChild(checkbox);
                    row.appendChild(msgWrap);
                    body.appendChild(row);
                });

                pageInfo.textContent = (page + 1) + ' / ' + totalPages;
                prevBtn.disabled = page === 0;
                nextBtn.disabled = page >= totalPages - 1;
            }

            function close() {
                document.removeEventListener('keydown', onKey);
                overlay.remove();
            }
            function onKey(e) { if (e.key === 'Escape') close(); }

            prevBtn.addEventListener('click', () => {
                if (currentPage > 0) { currentPage--; renderMessages(currentPage); }
            });
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages - 1) { currentPage++; renderMessages(currentPage); }
            });

            selectAllBtn.addEventListener('click', () => {
                messages.forEach(m => {
                    if (!selectedMessages.includes(m)) selectedMessages.push(m);
                });
                renderMessages(currentPage);
                updateSelInfo();
            });

            invertBtn.addEventListener('click', () => {
                const next = messages.filter(m => !selectedMessages.includes(m));
                selectedMessages = next;
                renderMessages(currentPage);
                updateSelInfo();
            });

            clearBtn.addEventListener('click', () => {
                selectedMessages = [];
                renderMessages(currentPage);
                updateSelInfo();
            });

            closeIconBtn.addEventListener('click', close);
            cancelBtn.addEventListener('click', close);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close();
            });

            exportBtn.addEventListener('click', () => {
                const markdownContent = generateMdContent(selectedMessages);
                if (!markdownContent) {
                    alert(tt.alertEmpty);
                    return;
                }
                downloadMarkdown(markdownContent, getUserSessionTitle());
                close();
            });

            document.addEventListener('keydown', onKey);
            if (!document.getElementById('messageModal')) {
                document.body.appendChild(overlay);
            }
            renderMessages(currentPage);

            initConfig();
        })();
    }
});
