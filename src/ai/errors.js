// 统一错误文案。挂载到 window.KBErrors
(function (global) {
    const MAP = {
        zh: {
            no_key: '尚未配置 API Key，请先到设置页填入',
            auth: 'API Key 无效或已被禁用，请检查后重试',
            balance: '余额不足，请前往 DeepSeek 充值后再试',
            ratelimit: '调用过于频繁，请稍后再试',
            server: 'DeepSeek 服务暂时不可用，请稍后重试',
            network: '网络异常，请检查网络后重试',
            parse: '返回内容解析失败，请重试',
            unknown: '调用失败，请稍后重试',
        },
        en: {
            no_key: 'API Key not configured. Set it in Settings.',
            auth: 'API Key is invalid or disabled.',
            balance: 'Insufficient balance. Please top up your DeepSeek account.',
            ratelimit: 'Rate limited. Please retry later.',
            server: 'DeepSeek service is temporarily unavailable.',
            network: 'Network error. Please check your connection.',
            parse: 'Response parsing failed. Please retry.',
            unknown: 'Call failed. Please retry.',
        },
    };

    function describe(err, lang) {
        const dict = MAP[lang] || MAP.zh;
        const kind = (err && err.kind) || 'unknown';
        return dict[kind] || dict.unknown;
    }

    global.KBErrors = { describe };
})(typeof window !== 'undefined' ? window : self);
