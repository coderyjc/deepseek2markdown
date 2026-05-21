// IndexedDB schema 与底层连接
// 在 popup.html / sidepanel.html 中加载，挂载到 window.KBSchema
(function (global) {
    const DB_NAME = 'deepseek2markdown_kb';
    const DB_VERSION = 4;

    const STORE_CONVERSATIONS = 'conversations';
    const STORE_MESSAGES = 'messages';
    const STORE_RECALL_CONVS = 'recall_conversations';
    const STORE_KNOWLEDGE_CARDS = 'knowledge_cards';
    const STORE_WORKFLOWS = 'workflows';

    let dbPromise = null;

    function openDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_CONVERSATIONS)) {
                    const conv = db.createObjectStore(STORE_CONVERSATIONS, { keyPath: 'id' });
                    conv.createIndex('createdAt', 'createdAt');
                    conv.createIndex('savedAt', 'savedAt');
                }
                if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
                    const msg = db.createObjectStore(STORE_MESSAGES, { keyPath: 'id', autoIncrement: true });
                    msg.createIndex('conversationId', 'conversationId');
                    msg.createIndex('conv_idx', ['conversationId', 'idx']);
                }
                if (!db.objectStoreNames.contains(STORE_RECALL_CONVS)) {
                    const rc = db.createObjectStore(STORE_RECALL_CONVS, { keyPath: 'id' });
                    rc.createIndex('createdAt', 'createdAt');
                    rc.createIndex('updatedAt', 'updatedAt');
                }
                if (!db.objectStoreNames.contains(STORE_KNOWLEDGE_CARDS)) {
                    const kc = db.createObjectStore(STORE_KNOWLEDGE_CARDS, { keyPath: 'id' });
                    kc.createIndex('createdAt', 'createdAt');
                    kc.createIndex('updatedAt', 'updatedAt');
                }
                if (!db.objectStoreNames.contains(STORE_WORKFLOWS)) {
                    const wf = db.createObjectStore(STORE_WORKFLOWS, { keyPath: 'id' });
                    wf.createIndex('createdAt', 'createdAt');
                    wf.createIndex('updatedAt', 'updatedAt');
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return dbPromise;
    }

    function tx(storeNames, mode) {
        return openDB().then((db) => db.transaction(storeNames, mode));
    }

    function reqToPromise(req) {
        return new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    global.KBSchema = {
        openDB,
        tx,
        reqToPromise,
        STORE_CONVERSATIONS,
        STORE_MESSAGES,
        STORE_RECALL_CONVS,
        STORE_KNOWLEDGE_CARDS,
        STORE_WORKFLOWS,
    };
})(typeof window !== 'undefined' ? window : self);
