// =====================
// 配置
// =====================
const config = {
    mainPageSelector: '.cb86951c', // 主页面
    chatContainerSelector: '.dad65929',  // 聊天框容器

    userClassPrefix: '_9663006',             // 用户消息 class 前缀

    aiClassPrefix: '_4f9bf79',           // AI消息相关 class 前缀

    aiChainOfThought: '._48edb25',        // AI的思维链, 包含"已深度思考xxx秒"和"思考过程"
    searchHintSelector: '._58a6d71._19db599', // 搜索/思考时间, "已深度思考xxx秒"
    thinkingChainSelector: '.e1675d8b',  // 思考链, "思考过程"

    userSessionTitleSelector: '.d8ed659a',    // 用户会话标题
    finalAnswerSelector: 'div.ds-markdown.ds-markdown--block', // 回答的内容
    isExportChainOfThought: false,        // 是否导出思考链
    isExportBusyServerMessages: false,    // 是否导出繁忙消息，默认不导出
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
            const userMessage = `# 用户：\n\n${node.textContent.trim()}`;

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
// 导出功能
// =====================
function exportMarkdown() {
    const mdContent = generateMdContent();
    if (!mdContent) {
        alert("未找到聊天记录！");
        return;
    }
    return mdContent;
}

// TODO 
function exportPDF() {
    const mdContent = generateMdContent();
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


// ===================== 添加chrome消息通信机制 =====================

// 监听来自 popup.js 的消息

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
        const markdown = exportMarkdown();
        downloadMarkdown(markdown, getUserSessionTitle());
        initConfig();
    }
    else if (request.action === 'generateImage') {
        exportImage();
        initConfig();
    }
    else if (request.action === 'generatePDF') {
        const pdf = exportPDF();
        downloadPDF(pdf, getUserSessionTitle());
        initConfig();
    }
    else if (request.action === 'showNotificationImage') {
        // 创建消息框
        const notificationDiv = document.createElement('div');
        notificationDiv.id = 'notification';
        notificationDiv.style.position = 'fixed';
        notificationDiv.style.top = '20px';
        notificationDiv.style.left = '50%';
        notificationDiv.style.transform = 'translateX(-50%)';
        notificationDiv.style.backgroundColor = '#4CAF50';
        notificationDiv.style.color = 'white';
        notificationDiv.style.padding = '10px 25px';
        notificationDiv.style.borderRadius = '5px';
        notificationDiv.style.zIndex = '1000';

        notificationDiv.textContent = '开始下载...';

        try {
            exportImage()
            document.querySelector('.cb86951c').appendChild(notificationDiv);
        } catch (error) {
            console.log(error)
            notificationDiv.textContent = '下载失败';
            notificationDiv.style.backgroundColor = '#fa3668';
            document.querySelector('.cb86951c').appendChild(notificationDiv);
        }

        // 3秒后移除消息框
        setTimeout(() => {
            notificationDiv.remove();
        }, 2000);
    }
    else if (request.action === 'generateBatch') {
        const messages = getOrderedMessages();
        let currentPage = 0;
        const messagesPerPage = 10;
        let selectedMessages = [];

        // 创建模态框
        const modal = document.createElement('div');
        modal.id = 'messageModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        modal.style.padding = '20px';
        modal.style.zIndex = '1001';
        modal.style.overflowY = 'auto';

        // 创建模态框内容
        const modalContent = document.createElement('div');
        modalContent.style.maxHeight = 'calc(100% - 100px)';
        modalContent.style.overflowY = 'auto';

        function renderMessages(page) {
            modalContent.innerHTML = '';
            const start = page * messagesPerPage;
            const end = start + messagesPerPage;
            const pageMessages = messages.slice(start, end);

            const table = document.createElement('table');
            table.style.width = '98%';
            table.style.borderCollapse = 'collapse';

            pageMessages.forEach((message, index) => {
                const row = document.createElement('tr');
                row.style.borderBottom = '1px solid #ddd';

                const idCell = document.createElement('td');
                idCell.style.padding = '8px';
                idCell.style.width = '25px';
                idCell.textContent = start + index + 1;

                const checkboxCell = document.createElement('td');
                checkboxCell.style.padding = '8px';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `message_${start + index}`;
                checkbox.value = message;
                checkbox.checked = selectedMessages.includes(message);
                checkbox.addEventListener('change', (event) => {
                    if (event.target.checked) {
                        selectedMessages.push(message);
                    } else {
                        selectedMessages = selectedMessages.filter(m => m !== message);
                    }
                });
                checkboxCell.appendChild(checkbox);

                const messageCell = document.createElement('td');
                messageCell.style.padding = '8px';
                messageCell.style.color = 'black';
                const label = document.createElement('label');
                label.htmlFor = `message_${start + index}`;
                label.textContent = message.length > 150 ? message.substring(0, 150) + '...' : message;

                const toggleButton = document.createElement('button');
                toggleButton.textContent = '展开';
                toggleButton.style.marginLeft = '10px';
                toggleButton.style.cursor = 'pointer';
                toggleButton.style.background = 'none';
                toggleButton.style.border = 'none';
                toggleButton.style.color = '#4D6BFE';
                toggleButton.style.textDecoration = 'underline';
                toggleButton.addEventListener('click', () => {
                    if (toggleButton.textContent === '展开') {
                        label.textContent = message;
                        toggleButton.textContent = '收起';
                    } else {
                        label.textContent = message.length > 150 ? message.substring(0, 150) + '...' : message;
                        toggleButton.textContent = '展开';
                    }
                });

                messageCell.appendChild(label);
                messageCell.appendChild(toggleButton);

                row.appendChild(idCell);
                row.appendChild(checkboxCell);
                row.appendChild(messageCell);
                table.appendChild(row);
            });

            modalContent.appendChild(table);
        }

        // 按钮样式
        const buttonStyle = {
            marginTop: '10px',
            marginRight: '10px',
            padding: '10px 20px',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
        };

        // 创建分页按钮
        const paginationDiv = document.createElement('div');
        paginationDiv.style.textAlign = 'center';
        paginationDiv.style.marginTop = '20px';

        const prevButton = document.createElement('button');
        prevButton.textContent = '上一页';
        Object.assign(prevButton.style, buttonStyle, { backgroundColor: '#4D6BFE' });
        prevButton.disabled = currentPage === 0;

        prevButton.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                renderMessages(currentPage);
                nextButton.disabled = false;
                if (currentPage === 0) prevButton.disabled = true;
            }
        });

        const nextButton = document.createElement('button');
        nextButton.textContent = '下一页';
        Object.assign(nextButton.style, buttonStyle, { backgroundColor: '#4D6BFE' });
        nextButton.disabled = (currentPage + 1) * messagesPerPage >= messages.length;

        nextButton.addEventListener('click', () => {
            if ((currentPage + 1) * messagesPerPage < messages.length) {
                currentPage++;
                renderMessages(currentPage);
                prevButton.disabled = false;
                if ((currentPage + 1) * messagesPerPage >= messages.length) nextButton.disabled = true;
            }
        });

        paginationDiv.appendChild(prevButton);
        paginationDiv.appendChild(nextButton);

        // 创建全选按钮
        const selectAllButton = document.createElement('button');
        selectAllButton.textContent = '全选';
        Object.assign(selectAllButton.style, buttonStyle, { backgroundColor: '#2196F3' });

        selectAllButton.addEventListener('click', () => {
            const checkboxes = modalContent.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                const message = checkbox.value;
                if (!selectedMessages.includes(message)) {
                    selectedMessages.push(message);
                }
            });
        });

        // 创建反选按钮
        const deselectAllButton = document.createElement('button');
        deselectAllButton.textContent = '反选';
        Object.assign(deselectAllButton.style, buttonStyle, { backgroundColor: '#FF9800' });

        deselectAllButton.addEventListener('click', () => {
            const checkboxes = modalContent.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = !checkbox.checked;
                const message = checkbox.value;
                if (checkbox.checked) {
                    if (!selectedMessages.includes(message)) {
                        selectedMessages.push(message);
                    }
                } else {
                    selectedMessages = selectedMessages.filter(m => m !== message);
                }
            });
        });

        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        Object.assign(closeButton.style, buttonStyle, { backgroundColor: '#f44336' });

        closeButton.addEventListener('click', () => {
            modal.remove();
        });

        // 创建生成按钮
        const generateButton = document.createElement('button');
        generateButton.textContent = '导出Markdown';
        Object.assign(generateButton.style, buttonStyle, { backgroundColor: '#4CAF50' });
        generateButton.addEventListener('click', () => {
            const markdownContent = generateMdContent(selectedMessages);
            if (!markdownContent) {
                alert("请选择要导出的消息！");
                return;
            }
            // 下载选中的消息
            downloadMarkdown(markdownContent, getUserSessionTitle());

            // 关闭模态框
            modal.remove();
        });

        modal.appendChild(modalContent);
        modal.appendChild(paginationDiv);
        modal.appendChild(generateButton);
        modal.appendChild(selectAllButton);
        modal.appendChild(deselectAllButton);
        modal.appendChild(closeButton);

        // 监听esc按键事件
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                modal.remove();
            }
        });
        if (!document.getElementById('messageModal')) {
            document.body.appendChild(modal);
        }

        renderMessages(currentPage);

        initConfig();
    }
});
