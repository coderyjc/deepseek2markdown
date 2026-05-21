// 已移除「展开配置信息」面板，导出行为使用 content.js 中的默认配置：
//   - 不导出思维链
//   - 不导出服务器繁忙消息

// 选择性导出
document.getElementById('exportBatch').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'trackEvent', name: 'selective_export' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (!tab || (tab.url && !tab.url.startsWith('https://chat.deepseek.com'))) { showNotOnDSToast(); return; }
        chrome.tabs.sendMessage(tab.id, { action: "generateBatch" });
    });
});

// 导出Markdown
document.getElementById('exportAsMarkdown').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'trackEvent', name: 'export_markdown' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (!tab || (tab.url && !tab.url.startsWith('https://chat.deepseek.com'))) { showNotOnDSToast(); return; }
        chrome.tabs.sendMessage(tab.id, { action: "generateMarkdown" });
    });
});

// 导出PDF
document.getElementById('exportAsPDF').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'trackEvent', name: 'export_pdf' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (!tab || (tab.url && !tab.url.startsWith('https://chat.deepseek.com'))) { showNotOnDSToast(); return; }
        chrome.tabs.sendMessage(tab.id, { action: "generatePDF" });
    });
});

// 导出图像
document.getElementById('exportAsImage').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'trackEvent', name: 'export_image' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (!tab || (tab.url && !tab.url.startsWith('https://chat.deepseek.com'))) { showNotOnDSToast(); return; }
        chrome.tabs.sendMessage(tab.id, { action: 'showNotificationImage' });
    });
});

// =====================
// 知识库 + 设置
// =====================
function showToast(message, type, opts) {
    const el = document.getElementById('kbToast');
    if (!el) return;
    el.className = 'kb-toast' + (type ? ' ' + type : '');
    if (opts && opts.hint) {
        el.innerHTML = message + '<br><span class="kb-toast-hint">' + opts.hint + '</span>';
        if (opts.actionText && opts.actionFn) {
            const btn = document.createElement('button');
            btn.className = 'kb-toast-action';
            btn.textContent = opts.actionText;
            btn.addEventListener('click', () => { el.hidden = true; opts.actionFn(); });
            el.querySelector('.kb-toast-hint').appendChild(btn);
        }
    } else {
        el.textContent = message;
    }
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.hidden = true; }, 3000);
}

function showNotOnDSToast() {
    const t = translations[currentLang] || translations.zh;
    showToast(t.notOnDS, 'error', {
        hint: t.notOnDSHint,
        actionText: t.refresh,
        actionFn: () => { chrome.tabs.reload(); },
    });
}

document.getElementById('openKB').addEventListener('click', async () => {
    chrome.runtime.sendMessage({ action: 'trackEvent', name: 'open_knowledge_base' });
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (chrome.sidePanel && chrome.sidePanel.open) {
            await chrome.sidePanel.open({ windowId: tab.windowId });
            window.close();
            return;
        }
    } catch (e) {
        // 回退到独立 tab
    }
    chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel/sidepanel.html') });
});

document.getElementById('openSettings').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'trackEvent', name: 'open_settings' });
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    }
});

// TODO 需要测试一下这样是否可行。
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
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
        openKB: "知识库",
        openSettings: "设置",
        exportBatch: "选择性导出",
        exportAsMarkdown: "导出为 Markdown",
        exportAsPDF: "导出为 PDF",
        exportAsImage: "导出为图像",
        languageToggle: "中文|EN",
        notOnDS: "请在 DeepSeek 对话页使用",
        notOnDSHint: "如果你已经在对话页，请点击",
        refresh: "刷新",
    },
    en: {
        openKB: "Knowledge Base",
        openSettings: "Settings",
        exportBatch: "Selective Export",
        exportAsMarkdown: "Export as Markdown",
        exportAsPDF: "Export as PDF",
        exportAsImage: "Export as Image",
        languageToggle: "中文|EN",
        notOnDS: "Open a DeepSeek chat page first",
        notOnDSHint: "If you are already on a chat page, click",
        refresh: "Refresh",
    }
};

let currentLang = 'zh';

function updateLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key] !== undefined) el.textContent = t[key];
    });

    document.getElementById('languageToggle').textContent = t.languageToggle;
    chrome.storage.local.set({ language: lang });
}

document.getElementById('languageToggle').addEventListener('click', () => {
    updateLanguage(currentLang === 'zh' ? 'en' : 'zh');
});

chrome.storage.local.get('language', (result) => {
    updateLanguage(result.language || 'zh');
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.language && changes.language.newValue !== currentLang) {
        updateLanguage(changes.language.newValue);
    }
});
