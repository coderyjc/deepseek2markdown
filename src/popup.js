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
