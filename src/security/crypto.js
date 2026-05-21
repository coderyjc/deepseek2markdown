// AES-GCM-256 加密层。主密钥首次使用时生成，存入 IndexedDB（extractable:false），
// 之后无法被任何代码导出。挂载到 window.KBCrypto。
(function (global) {
    const DB_NAME = 'deepseek2markdown_keystore';
    const STORE = 'keys';
    const KEY_ID = 'master_v1';

    function openKeystore() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    db.createObjectStore(STORE);
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function getOrCreateMasterKey() {
        const db = await openKeystore();
        const existing = await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const r = tx.objectStore(STORE).get(KEY_ID);
            r.onsuccess = () => resolve(r.result || null);
            r.onerror = () => reject(r.error);
        });
        if (existing) return existing;

        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            false, // extractable: false → 永远不可被导出
            ['encrypt', 'decrypt']
        );
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(key, KEY_ID);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        return key;
    }

    function bufToB64(buf) {
        const bytes = new Uint8Array(buf);
        let s = '';
        for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
        return btoa(s);
    }

    function b64ToBuf(b64) {
        const s = atob(b64);
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
        return bytes;
    }

    async function encryptString(plain) {
        if (!plain) return '';
        const key = await getOrCreateMasterKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder().encode(plain);
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
        const out = new Uint8Array(iv.length + ct.byteLength);
        out.set(iv, 0);
        out.set(new Uint8Array(ct), iv.length);
        return bufToB64(out.buffer);
    }

    async function decryptString(b64) {
        if (!b64) return '';
        const key = await getOrCreateMasterKey();
        const all = b64ToBuf(b64);
        const iv = all.slice(0, 12);
        const ct = all.slice(12);
        const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
        return new TextDecoder().decode(dec);
    }

    global.KBCrypto = { encryptString, decryptString };
})(typeof window !== 'undefined' ? window : self);
