// 获取第一个开关元素（导出思维链）
document.getElementById('exportChainOfThought').addEventListener('change', (event) => {
    const isChecked = event.target.checked;

    // 发送消息给 content.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            action: 'updateExportChainOfThoughtState',
            state: isChecked
        });
    });
});

// 获取第二个开关元素（屏蔽消息繁忙）
document.getElementById('blockBusyMessages').addEventListener('change', (event) => {
    const isChecked = event.target.checked;

    // 发送消息给 content.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            action: 'updateBlockBusyMessagesState',
            state: isChecked
        });
    });
});

// 批量导出Markdown
document.getElementById('exportBatch').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "generateBatch" });
    });
});

// 导出Markdown
document.getElementById('exportAsMarkdown').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "generateMarkdown" });
    });
});

// 导出PDF的按钮
document.getElementById('exportAsPDF').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "generatePDF" });
    });
});

// 导出Image的按钮
document.getElementById('exportAsImage').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showNotificationImage' });
    });
});

// 每次打开popup时，更新 switch 状态为 false
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
        action: 'updateSwitchState',
        state: false
    });
    chrome.tabs.sendMessage(activeTab.id, {
        action: 'updateBlockBusyMessagesState',
        state: false
    });
});

// TODO 需要测试一下这样是否可行。
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // 插件安装时执行
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.url && tab.url.startsWith('http')) {
                    chrome.tabs.reload(tab.id);
                }
            });
        });
    }
});

// 语言配置
const translations = {
    zh: {
        summary: "🔨展开配置信息",
        exportChainOfThought: "导出思维链",
        blockBusyMessages: "导出消息繁忙",
        exportBatch: "📦批量导出",
        exportAsMarkdown: "📄导出为Markdown",
        exportAsPDF: "📕导出为PDF",
        exportAsImage: "🏞️导出为图像",
        languageToggle: "中文|EN"
    },
    en: {
        summary: "🔨Expand Configuration Information",
        exportChainOfThought: "Export Chain of Thought",
        blockBusyMessages: "Export Busy Messages",
        exportBatch: "📦Batch Export",
        exportAsMarkdown: "📄Export as Markdown",
        exportAsPDF: "📕Export as PDF",
        exportAsImage: "🏞️Export as Image",
        languageToggle: "中文|EN"
    }
};

// 当前语言
let currentLang = 'zh';

// 更新页面文本
function updateLanguage(lang) {
    currentLang = lang;
    // 更新所有文本内容
    document.querySelector('summary').textContent = translations[lang].summary;
    document.querySelector('.switch-option:nth-child(1) span').textContent = translations[lang].exportChainOfThought;
    document.querySelector('.switch-option:nth-child(2) span').textContent = translations[lang].blockBusyMessages;
    document.getElementById('exportBatch').textContent = translations[lang].exportBatch;
    document.getElementById('exportAsMarkdown').textContent = translations[lang].exportAsMarkdown;
    document.getElementById('exportAsPDF').textContent = translations[lang].exportAsPDF;
    document.getElementById('exportAsImage').textContent = translations[lang].exportAsImage;
    document.getElementById('languageToggle').textContent = translations[lang].languageToggle;
    
    // 保存语言设置
    chrome.storage.local.set({ language: lang });
}

// 语言切换按钮事件监听
document.getElementById('languageToggle').addEventListener('click', () => {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    updateLanguage(newLang);
});

// 初始化语言设置
chrome.storage.local.get('language', (result) => {
    const savedLang = result.language || 'zh';
    updateLanguage(savedLang);
});
