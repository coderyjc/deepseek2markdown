// BYOK 配置仓库。挂载到 window.KBSettings
(function (global) {
    const STORAGE_KEY = 'kb_settings_v1';

    const DEFAULTS = {
        encKeyPrimary: '',     // 加密后的主 Key
        encKeyBackup: '',      // 加密后的备用 Key
        activeSlot: 'primary', // 'primary' | 'backup'
        model: 'deepseek-chat',
        autoSummarize: true,
        autoSave: true,
        usage: {
            calls: 0,
            promptTokens: 0,
            completionTokens: 0,
            lastReset: Date.now(),
        },
    };

    function readAll() {
        return new Promise((resolve) => {
            chrome.storage.local.get(STORAGE_KEY, (res) => {
                const cur = res[STORAGE_KEY] || {};
                resolve(Object.assign({}, DEFAULTS, cur, {
                    usage: Object.assign({}, DEFAULTS.usage, (cur && cur.usage) || {}),
                }));
            });
        });
    }

    function writeAll(s) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [STORAGE_KEY]: s }, () => resolve());
        });
    }

    async function getMeta() {
        const s = await readAll();
        return {
            hasPrimary: !!s.encKeyPrimary,
            hasBackup: !!s.encKeyBackup,
            activeSlot: s.activeSlot,
            model: s.model,
            autoSummarize: s.autoSummarize,
            autoSave: s.autoSave,
            usage: s.usage,
        };
    }

    async function setKey(slot, plainKey) {
        if (slot !== 'primary' && slot !== 'backup') throw new Error('invalid slot');
        const s = await readAll();
        const enc = plainKey ? await global.KBCrypto.encryptString(plainKey) : '';
        if (slot === 'primary') s.encKeyPrimary = enc;
        else s.encKeyBackup = enc;
        await writeAll(s);
    }

    async function clearKey(slot) {
        const s = await readAll();
        if (slot === 'primary') s.encKeyPrimary = '';
        else if (slot === 'backup') s.encKeyBackup = '';
        if (!s.encKeyPrimary && s.activeSlot === 'primary' && s.encKeyBackup) {
            s.activeSlot = 'backup';
        } else if (!s.encKeyBackup && s.activeSlot === 'backup' && s.encKeyPrimary) {
            s.activeSlot = 'primary';
        }
        await writeAll(s);
    }

    async function setActiveSlot(slot) {
        if (slot !== 'primary' && slot !== 'backup') throw new Error('invalid slot');
        const s = await readAll();
        s.activeSlot = slot;
        await writeAll(s);
    }

    async function setModel(model) {
        const s = await readAll();
        s.model = model;
        await writeAll(s);
    }

    async function setAutoSummarize(v) {
        const s = await readAll();
        s.autoSummarize = !!v;
        await writeAll(s);
    }

    async function setAutoSave(v) {
        const s = await readAll();
        s.autoSave = !!v;
        await writeAll(s);
    }

    // 获取活跃 Key 的明文（仅在调用 API 时短暂使用，不要长期持有）
    // 返回 { key, slot } 或 null
    async function getActiveKey() {
        const s = await readAll();
        const slot = s.activeSlot;
        const enc = slot === 'primary' ? s.encKeyPrimary : s.encKeyBackup;
        if (!enc) {
            // fallback 到另一个 slot
            const other = slot === 'primary' ? s.encKeyBackup : s.encKeyPrimary;
            if (!other) return null;
            const plain = await global.KBCrypto.decryptString(other);
            return { key: plain, slot: slot === 'primary' ? 'backup' : 'primary' };
        }
        const plain = await global.KBCrypto.decryptString(enc);
        return { key: plain, slot };
    }

    async function bumpUsage(delta) {
        const s = await readAll();
        s.usage.calls += 1;
        s.usage.promptTokens += (delta && delta.prompt_tokens) || 0;
        s.usage.completionTokens += (delta && delta.completion_tokens) || 0;
        await writeAll(s);
    }

    async function resetUsage() {
        const s = await readAll();
        s.usage = { calls: 0, promptTokens: 0, completionTokens: 0, lastReset: Date.now() };
        await writeAll(s);
    }

    global.KBSettings = {
        getMeta,
        setKey,
        clearKey,
        setActiveSlot,
        setModel,
        setAutoSummarize,
        setAutoSave,
        getActiveKey,
        bumpUsage,
        resetUsage,
    };
})(typeof window !== 'undefined' ? window : self);
