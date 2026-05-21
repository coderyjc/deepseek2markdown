<div align=center>
<img src="./doc/banner.png" width="800" />
</div>

<div align=center>
<a href="./README.md">简体中文</a> | English
</div>

<div align=center>

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jfolcdbejlennfldgbninbjglbahaejn)](https://chromewebstore.google.com/detail/deepseek2markdown/jfolcdbejlennfldgbninbjglbahaejn)

</div>

**DeepSeek Copilot** is a Chrome extension that turns your DeepSeek conversations into a **personal knowledge base**. Export conversations as Markdown / PDF / images, search with natural language, generate AI summaries, and distill knowledge into cards and workflows — all stored locally. Just bring your own API Key.

---

## Features

### Export Conversations

Export DeepSeek conversations to **Markdown**, **PDF**, or **images** with one click. Supports selective batch export.

### Knowledge Base

<div align=center>
<img src="./doc/01.png" width="700" />
</div>

Save conversations to a local knowledge base. Browse, search, and get AI-generated summaries and tags. Auto-save is also supported.

### AI Recall

<div align=center>
<img src="./doc/02.png" width="700" />
</div>

Search your knowledge base using natural language. AI answers in streaming mode based on your saved conversations, supports multi-turn follow-ups, and cited conversations are clickable for quick navigation.

### Knowledge Distillation

<div align=center>
<img src="./doc/03.png" width="700" />
</div>

Extract **Knowledge Cards** (structured articles) or **Workflows** (reusable procedures) from multiple conversations, turning scattered dialogues into organized knowledge.

### Quick Actions

<div align=center>
<img src="./doc/04.png" width="350" />
</div>

Use the Popup to quickly export the current conversation, open the knowledge base, or access settings.

---

## Highlights

| Feature | Description |
|---|---|
| Local-first | All data stored in IndexedDB, nothing uploaded to any server |
| BYOK | Bring Your Own DeepSeek API Key — zero cost, zero subscriptions |
| Encrypted Keys | API keys stored with AES-GCM-256 encryption |
| Auto-save | Conversations saved automatically as you browse |
| Bilingual | Switch between Chinese and English UI |
| Usage Dashboard | Track API calls, token usage, and estimated costs |

---

## Installation

### Option 1: Chrome Web Store (Recommended)

Install directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/deepseek2markdown/jfolcdbejlennfldgbninbjglbahaejn).

### Option 2: Load Unpacked Extension

1. Open Chrome and go to `chrome://extensions/`, enable **Developer mode**
2. Click "Load unpacked" and select the `src` folder from this project
3. Pin the extension in your toolbar

> **Note**: If you already have DeepSeek open before loading the extension for the first time, refresh the page.

---

## Feedback & Contributions

If you encounter issues or have suggestions, feel free to submit an [Issue](https://github.com/coderyjc/deepseek2markdown/issues) or PR.

## Acknowledgments

[DeepSeek-Chat-Exporter](https://github.com/blueberrycongee/DeepSeek-Chat-Exporter)
