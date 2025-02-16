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
function resolveTag_p(node) {
    let content = '';
    node.childNodes.forEach((childNode) => {
        if (childNode.nodeType === Node.TEXT_NODE) {
            content += childNode.textContent.trim();
        } 
        else if (childNode.classList && childNode.classList.contains('katex')) {
            const tex = childNode.querySelector('annotation[encoding="application/x-tex"]');
            if (tex) {
                content += `$${tex.textContent.trim()}$`;
            }
        } 
        else if (childNode.tagName === 'STRONG') {
            content += `**${childNode.textContent.trim()}**`;
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
        else if (childNode.tagName === 'CODE') {
            content += `\`${childNode.textContent.trim()}\``;
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

// ! 这段代码有问题，暂时不用，有空再修复。。。
function resolveTag_ul_li(node) {
    let markdown = '';

    // 递归处理子节点
    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // 文本节点直接返回内容
            return node.textContent.trim();
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 处理元素节点
            const tagName = node.tagName.toLowerCase();
            const children = Array.from(node.childNodes);

            switch (tagName) {
                case 'ol':
                    let olContent = '';
                    children.forEach((child, index) => {
                        if (child.tagName && child.tagName.toLowerCase() === 'li') {
                            olContent += `${index + 1}. ${processNode(child)}\n`;
                        }
                    });
                    console.log('olcontent', olContent);
                    return olContent;
                case 'ul':
                    let ulContent = '';
                    children.forEach((child) => {
                        if (child.tagName && child.tagName.toLowerCase() === 'li') {
                            ulContent += `- ${processNode(child)}\n`;
                        }
                    });
                    console.log('ulcontent', ulContent);
                    return ulContent;
                case 'li':
                    return children.map((child) => processNode(child)).join('');
                case 'p':
                    return children.map((child) => processNode(child)).join('') + '\n\n';
                case 'strong':
                    return `**${children.map((child) => processNode(child)).join('')}**`;
                case 'br':
                    return '\n';
                case 'code': 
                    return `\`${node.textContent.trim()}\``;
                case 'pre':
                    return resolveTag_pre(node);
                default:
                    // 其他元素（如 span）直接处理其子节点
                    return children.map((child) => processNode(child)).join('');
            }
        }
        return '';
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
        .katex-display.ds-markdown-math, \
        hr');

    elements.forEach((element) => {
        if (element.tagName.toLowerCase() === 'p') {
            answerContent += resolveTag_p(element);
            answerContent += '\n\n';
        }
        else if (element.tagName.toLowerCase() === 'h1') {
            answerContent += `# ${element.textContent.trim()}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'h2') {
            answerContent += `## ${element.textContent.trim()}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'h3') {
            answerContent += `### ${element.textContent.trim()}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'h4') {
            answerContent += `#### ${element.textContent.trim()}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'h5') {
            answerContent += `##### ${element.textContent.trim()}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'hr') {
            answerContent += '\n---\n';
        }
        else if (element.tagName.toLowerCase() === 'blockquote') {
            answerContent += `> ${resolveTag_p(element.querySelector('p'))}\n\n`;
        }
        else if (element.tagName.toLowerCase() === 'ul' || element.tagName.toLowerCase() === 'ol') {
            answerContent += `${resolveTag_ul_li(element)}\n\n`;
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