const DEFAULT_MODEL = 'doubao-seed-1-6-lite-251015';
const DEFAULT_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

const SYSTEM_PROMPT = [
    '你是“面包”，在这个个人博客里以博主分身的身份和访客聊天。',
    '说话风格要轻松幽默，像朋友闲聊，偶尔带点自嘲，喜欢用比喻。',
    '自然地使用这些口头禅，但不要每句都堆：你猜怎么着、说真的、哈哈哈。',
    '回答特点：懂的就认真讲清楚，不懂的就老实承认，不装懂。',
    '遇到技术问题时，用简单易懂的方式解释，少用术语堆砌。',
    '聊天时可以偶尔反问对方“你呢？”“你觉得呢？”来延续对话。',
    '你可以结合博客语境来回答，比如这里像博主的小客厅、日记本、工具箱。',
    '语气自然、温暖、真诚，不油腻，不客服腔。',
    '默认使用简体中文回答。'
].join('\n');

function createCorsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin'
    };
}

function jsonResponse(data, status = 200, origin = '*') {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...createCorsHeaders(origin)
        }
    });
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '*';

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: createCorsHeaders(origin)
            });
        }

        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method Not Allowed' }, 405, origin);
        }

        if (!env.VOLCENGINE_API_KEY) {
            return jsonResponse({ error: 'Missing VOLCENGINE_API_KEY secret' }, 500, origin);
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
        }

        const incomingMessages = Array.isArray(body.messages) ? body.messages : [];
        const normalizedMessages = incomingMessages
            .filter((message) => message && typeof message.content === 'string' && (message.role === 'user' || message.role === 'assistant'))
            .slice(-12);

        if (!normalizedMessages.length) {
            return jsonResponse({ error: 'messages is required' }, 400, origin);
        }

        const endpoint = env.ARK_ENDPOINT || DEFAULT_ENDPOINT;
        const model = env.ARK_MODEL || DEFAULT_MODEL;

        const upstreamResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.VOLCENGINE_API_KEY}`
            },
            body: JSON.stringify({
                model,
                temperature: 0.85,
                max_tokens: 800,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...normalizedMessages
                ]
            })
        });

        const data = await upstreamResponse.json().catch(() => ({}));
        if (!upstreamResponse.ok) {
            const detail = data && data.error && (data.error.message || data.error.code);
            return jsonResponse({
                error: detail || `Upstream request failed with status ${upstreamResponse.status}`
            }, upstreamResponse.status, origin);
        }

        const reply = data &&
            data.choices &&
            data.choices[0] &&
            data.choices[0].message &&
            data.choices[0].message.content;

        if (!reply) {
            return jsonResponse({ error: 'Empty reply from model provider' }, 502, origin);
        }

        return jsonResponse({
            reply: Array.isArray(reply) ? reply.join('') : String(reply).trim()
        }, 200, origin);
    }
};
