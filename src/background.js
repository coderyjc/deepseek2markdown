chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'export') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: extractConversation
            }, (results) => {
                const markdown = results[0].result;
                sendResponse({ markdown });
            });
        });
        return true; // 保持消息通道打开以等待响应
    }
});