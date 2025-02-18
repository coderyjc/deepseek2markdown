// =====================
// 配置
// =====================
const config = {
    chatContainerSelector: '.dad65929',  // 聊天框容器
    userClassPrefix: 'fa81',             // 用户消息 class 前缀
    aiClassPrefix: 'f9bf7997',           // AI消息相关 class 前缀
    aiReplyContainer: 'edb250b1',        // AI回复的主要容器
    searchHintSelector: '.a6d716f5.db5991dd', // 搜索/思考时间
    thinkingChainSelector: '.e1675d8b',  // 思考链
    userSessionTitleSelector: '.d8ed659a',    // 用户会话标题
    finalAnswerSelector: 'div.ds-markdown.ds-markdown--block', // 回答的内容
    isExportChainOfThought: false,        // 是否导出思考链
};

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
                        if (childNode.tagName === 'P') {
                            markdown += `${indent}- ${resolveTag_text(childNode)}\n`;
                        }
                        else if (childNode.classList.contains('md-code-block')) {
                            codeblock = resolveTag_pre(childNode.querySelector('pre'), childNode.querySelector('.md-code-block-infostring').textContent.trim());
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
                        if (childNode.tagName === 'P') {
                            markdown += `${indent}1. ${resolveTag_text(childNode)}\n`;
                        }
                        else if (childNode.classList.contains('md-code-block')) {
                            codeblock = resolveTag_pre(childNode.querySelector('pre'), childNode.querySelector('.md-code-block-infostring').textContent.trim());
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
    const elements = answerNode.querySelectorAll('.ds-markdown--block>.md-code-block, \
        .ds-markdown--block>p,\
        .ds-markdown--block>h1, \
        .ds-markdown--block>h2,\
        .ds-markdown--block>h3, \
        .ds-markdown--block>h4, \
        .ds-markdown--block>h5, \
        .ds-markdown--block>blockquote,\
        .ds-markdown--block>ol,\
        .ds-markdown--block>ul,\
        .ds-markdown--block>table,\
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
            codeblock = resolveTag_pre(element.querySelector('pre'), element.querySelector('.md-code-block-infostring').textContent.trim());
            answerContent += `${codeblock}\n\n`;
        }
    });

    return `${answerContent.trim()}`;
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
            messages.push(`# 用户：\n\n${node.textContent.trim()}`);
        } else if (isAIMessage(node)) {
            // AI 消息
            let output = '';
            const aiReplyContainer = node.querySelector(`.${config.aiReplyContainer}`);
            if (aiReplyContainer) {
                // 已深度思考xxx秒
                const searchHint = extractSearchOrThinking(aiReplyContainer);
                if (config.isExportChainOfThought && searchHint) output += `> ${searchHint}\n> \n`;
                // 思考过程
                const thinkingChain = extractThinkingChain(aiReplyContainer);
                if (config.isExportChainOfThought && thinkingChain) output += `${thinkingChain}\n`;
            } else {
                const searchHint = extractSearchOrThinking(node);
                if (searchHint) output += `${searchHint}\n`;
            }
            const finalAnswer = extractFinalAnswer(node);
            if (finalAnswer) output = `# DeepSeek：\n${output}\n**原始回答**\n\n${finalAnswer}\n\n`;
            if (output.trim()) {
                messages.push(output.trim());
            }
        }
    }
    return messages;
}

function generateMdContent() {
    const messages = getOrderedMessages();
    return messages.length ? messages.join('\n\n') : '';
}

// =====================
// 导出功能
// =====================
function exportMarkdown() {
    const mdContent = generateMdContent();
    if (!mdContent) {
        alert("未找到聊天记录！");
        return;
    }

    // const fixedMdContent = mdContent.replace(/(\*\*.*?\*\*)/g, '<strong>$1</strong>')
    //     .replace(/\(\s*([^)]*)\s*\)/g, '\\($1\\)')
    //     .replace(/\$\$\s*([^$]*)\s*\$\$/g, '$$$1$$');

    return mdContent;
}

// TODO 暂未开发
// function exportPDF() {
//     const mdContent = getOrderedMessages();
//     if (!mdContent) return;

//     const fixedMdContent = mdContent.replace(/(\*\*.*?\*\*)/g, '<strong>$1</strong>')
//         .replace(/\(\s*([^)]*)\s*\)/g, '\\($1\\)')
//         .replace(/\$\$\s*([^$]*)\s*\$\$/g, '$$1$$');

//     const printContent = `
//             <html>
//                 <head>
//                     <title>DeepSeek Chat Export</title>
//                     <style>
//                         body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
//                         h2 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
//                         .ai-answer { color: #1a7f37; margin: 15px 0; }
//                         .ai-chain { color: #666; font-style: italic; margin: 10px 0; }
//                         hr { border: 0; border-top: 1px solid #eee; margin: 25px 0; }
//                     </style>
//                 </head>
//                 <body>
//                     ${fixedMdContent.replace(/\*\*用户：\*\*\n/g, '<h2>用户提问</h2><div class="user-question">')
//             .replace(/\*\*DeepSeek：\*\*\n/g, '</div><h2>AI 回答</h2><div class="ai-answer">')
//             .replace(/\*\*思考链\*\*\n/g, '</div><h2>思维链</h2><div class="ai-chain">')
//             .replace(/\n/g, '<br>')
//             .replace(/---/g, '</div><hr>')}
//                 </body>
//             </html>
//         `;

//     const printWindow = window.open("", "_blank");
//     printWindow.document.write(printContent);
//     printWindow.document.close();
//     setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
// }


// ===================== 添加chrome消息通信机制 =====================

// 监听来自 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateSwitchState') {
        const switchState = request.state;
        if (switchState) {
            config.isExportChainOfThought = true;
        } else {
            config.isExportChainOfThought = false;
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateMarkdown') {
        const markdown = exportMarkdown();
        sendResponse({ markdown, title: getUserSessionTitle() });
    }
});