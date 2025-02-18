// 获取 input 元素
const switchInput = document.querySelector('.switch-container .switch input[type="checkbox"]');

// 监听 switch 状态变化
switchInput.addEventListener('change', (event) => {
    const isChecked = event.target.checked;

    // 发送消息给 content.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            action: 'updateSwitchState',
            state: isChecked
        });
    });
});

// 导出Markdown的按钮
document.getElementById('exportAsMarkdown').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // 向内容脚本发送消息
        chrome.tabs.sendMessage(tabs[0].id, { action: "generateMarkdown" }, (response) => {
            // 接收从 content.js 返回的 Markdown 内容
            const markdown = response.markdown;
            const title = response.title;

            // 创建一个 Blob 对象并下载
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = title + '.md';
            a.click();
        });
    });
});

// 导出PDF的按钮
document.getElementById('exportAsPDF').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // 向内容脚本发送消息
        chrome.tabs.sendMessage(tabs[0].id, { action: "generatePDF" }, (response) => {
            // 接收从 content.js 返回的 PDF 内容
            const pdf = response.pdf;

            const printWindow = window.open("", "_blank");
            printWindow.document.write(pdf);
            printWindow.document.close();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
       });
    });
});

// 每次打开popup时，更新 switch 状态为 false
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
        action: 'updateSwitchState',
        state: false
    });
});