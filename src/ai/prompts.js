// 摘要 prompt 模板。挂载到 window.KBPrompts
(function (global) {
    function summarizeSystemPrompt() {
        return [
            'You are a precise note-taking assistant for a personal knowledge base.',
            'Read a DeepSeek conversation and produce a concise summary.',
            'Output STRICT JSON ONLY, no markdown fences, no commentary.',
            'Schema: {"summary": string, "tags": string[]}',
            '- summary: 2-4 sentences, plain prose, in the same primary language as the conversation.',
            '- tags: 3-5 short topical labels (each <= 6 chars CJK or 1-2 English words).',
            'Avoid quoting the conversation verbatim. Focus on what was learned/decided.',
        ].join('\n');
    }

    function buildSummarizePayload(conversationText, model) {
        const text = (conversationText || '').slice(0, 32000);
        return {
            model: model || 'deepseek-chat',
            messages: [
                { role: 'system', content: summarizeSystemPrompt() },
                { role: 'user', content: text },
            ],
            temperature: 0.3,
            max_tokens: 400,
            response_format: { type: 'json_object' },
            stream: false,
        };
    }

    function recallSystemPrompt() {
        return [
            'You are a helpful assistant that searches a user\'s personal knowledge base of saved DeepSeek conversations.',
            'The user will ask a natural language question. You will receive conversation summaries as context.',
            '',
            'CRITICAL RULES:',
            '1. You MUST ONLY reference conversations that appear EXACTLY in the provided knowledge base context.',
            '2. NEVER fabricate, invent, or hallucinate conversation IDs, titles, or links.',
            '3. Every [[CONV:<id>|<title>]] link you output MUST use an ID that exists in the context. The <title> must also match the title from the context exactly.',
            '4. If the user asks "are there any others" or similar follow-ups, and you have already listed all relevant conversations from the context, you MUST say there are no more. Do NOT invent additional ones.',
            '5. If no conversations in the context are relevant to the question, say so politely. Do NOT make up conversations.',
            '',
            'For each relevant conversation, output:',
            '1. Why it is relevant (brief explanation)',
            '2. A knowledge base link using the EXACT format: [[CONV:<id>|<title>]] where <id> and <title> come directly from the context',
            '3. If the conversation has a URL, also output a DeepSeek link as: [🔗 DeepSeek原对话](<url>)',
            'If no conversations are relevant, say so politely in the user\'s language.',
            'Respond in the same language as the user\'s query.',
            'Be concise and helpful. Sort results by relevance (most relevant first).',
        ].join('\n');
    }

    function buildRecallPayload(userQuery, contextText, model, history) {
        const messages = [
            { role: 'system', content: recallSystemPrompt() },
        ];

        if (contextText) {
            // 首轮：附带知识库上下文
            messages.push({
                role: 'user',
                content: [
                    '--- BEGIN KNOWLEDGE BASE CONTEXT ---',
                    contextText,
                    '--- END KNOWLEDGE BASE CONTEXT ---',
                ].join('\n'),
            });
            messages.push({
                role: 'assistant',
                content: 'I have received the knowledge base context. I\'m ready to help you find relevant conversations.',
            });
        }

        // 追加历史对话
        if (history && history.length) {
            for (const h of history) {
                messages.push({ role: h.role, content: h.content });
            }
        }

        // 当前问题
        messages.push({ role: 'user', content: userQuery });

        return {
            model: model || 'deepseek-chat',
            messages,
            temperature: 0.3,
            max_tokens: 2000,
            stream: true,
        };
    }

    function buildTitlePayload(firstQuestion, model) {
        return {
            model: model || 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: 'Generate a short title (max 20 chars) summarizing the user\'s question. Output strict JSON only, no markdown fences: {"title": string}. The title should be in the same language as the question.',
                },
                { role: 'user', content: firstQuestion },
            ],
            temperature: 0.3,
            max_tokens: 60,
            response_format: { type: 'json_object' },
            stream: false,
        };
    }

    function distillSystemPrompt() {
        return [
            'You are a knowledge synthesis assistant. You receive multiple DeepSeek conversations on related topics and produce a single, well-structured knowledge article.',
            '',
            'Output STRICT JSON ONLY, no markdown fences, no commentary.',
            'Schema: {"title": string, "article": string, "summary": string, "tags": string[]}',
            '',
            'Rules:',
            '- title: A concise, descriptive title for the synthesized article (max 30 chars).',
            '- article: A structured Markdown article. Use ## headings for sections. Include definitions, core concepts, key takeaways, and a "相关对话" section listing the source conversation titles. The article should synthesize knowledge across all provided conversations, not just summarize each one individually. Write in the same primary language as the conversations.',
            '- summary: 1-2 sentence overview of the article.',
            '- tags: 3-6 short topical labels (each <= 6 chars CJK or 1-2 English words).',
        ].join('\n');
    }

    function buildDistillPayload(conversationTexts, model) {
        const parts = (conversationTexts || []).map((text, i) => '## Conversation ' + (i + 1) + '\n\n' + text);
        const combined = parts.join('\n\n---\n\n').slice(0, 48000);
        return {
            model: model || 'deepseek-chat',
            messages: [
                { role: 'system', content: distillSystemPrompt() },
                { role: 'user', content: combined },
            ],
            temperature: 0.3,
            max_tokens: 4000,
            response_format: { type: 'json_object' },
            stream: false,
        };
    }

    function workflowSystemPrompt() {
        return [
            'You are an AI workflow extraction engine.',
            'Your task is to convert lengthy AI conversations into reusable workflow assets.',
            'The workflow should represent: problem-solving approaches, actual work processes, reusable steps, key tips, important decisions, and common pitfalls.',
            '',
            'Output STRICT JSON ONLY, no markdown fences, no commentary.',
            'Schema: {"title": string, "article": string, "summary": string, "tags": string[]}',
            '',
            'Rules:',
            '- title: A concise workflow title (max 30 chars).',
            '- article: A structured Markdown workflow document with these sections:',
            '  ## 目标 (Goal) — What this workflow achieves',
            '  ## 前提条件 (Prerequisites) — What you need before starting',
            '  ## 逐步操作 (Steps) — Numbered, actionable steps. Each step should be concise but complete.',
            '  ## 重要提示 (Key Tips) — Critical insights, best practices, high-value prompts',
            '  ## 错误与修正 (Errors & Fixes) — Common mistakes and how to fix them',
            '  ## 最终结果 (Expected Outcome) — What success looks like',
            '  ## 相关对话 (Source Conversations) — List the source conversation titles',
            '- summary: 1-2 sentence overview of the workflow.',
            '- tags: 3-6 short topical labels (each <= 6 chars CJK or 1-2 English words).',
            '',
            'Extraction rules:',
            '- Focus ONLY on reusable workflows. Ignore: casual chat, repetitive discussion, emotional dialogue, ad-hoc exploration.',
            '- Merge repetitive discussions into clear workflow steps.',
            '- Preserve high-value prompts and tips verbatim.',
            '- Write in the same primary language as the conversations.',
        ].join('\n');
    }

    function buildWorkflowPayload(conversationTexts, model) {
        const parts = (conversationTexts || []).map((text, i) => '## Conversation ' + (i + 1) + '\n\n' + text);
        const combined = parts.join('\n\n---\n\n').slice(0, 48000);
        return {
            model: model || 'deepseek-chat',
            messages: [
                { role: 'system', content: workflowSystemPrompt() },
                { role: 'user', content: combined },
            ],
            temperature: 0.3,
            max_tokens: 4000,
            response_format: { type: 'json_object' },
            stream: false,
        };
    }

    global.KBPrompts = { buildSummarizePayload, buildRecallPayload, buildTitlePayload, buildDistillPayload, buildWorkflowPayload };
})(typeof window !== 'undefined' ? window : self);
