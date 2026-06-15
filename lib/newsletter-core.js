const crypto = require('crypto');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TABLE_NAME = 'newsletter_subscribers';
const DEFAULT_SITE_URL = 'https://yangmingli.com';

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function isValidEmail(email) {
    if (!email || email.length > 254 || email.includes('..')) {
        return false;
    }

    return EMAIL_PATTERN.test(email);
}

function sanitizeSource(value) {
    const source = String(value || 'website')
        .trim()
        .replace(/[^a-zA-Z0-9_./:-]/g, '-')
        .slice(0, 80);

    return source || 'website';
}

function getClientIp(req) {
    const forwarded = req.headers && (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']);
    if (forwarded) {
        return String(forwarded).split(',')[0].trim();
    }

    return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function hashForLog(value) {
    return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 12);
}

function safeJsonParse(text) {
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return null;
    }
}

async function readRequestBody(req) {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return req.body;
    }

    const raw = Buffer.isBuffer(req.body)
        ? req.body.toString('utf8')
        : typeof req.body === 'string'
        ? req.body
        : await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            req.on('error', reject);
        });

    if (!raw || !raw.trim()) {
        return {};
    }

    const contentType = String(req.headers && req.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('application/x-www-form-urlencoded')) {
        return Object.fromEntries(new URLSearchParams(raw));
    }

    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== 'object') {
        const error = new Error('Invalid JSON body');
        error.statusCode = 400;
        throw error;
    }

    return parsed;
}

function setJsonHeaders(res, methods = 'POST, OPTIONS') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', process.env.NEWSLETTER_ALLOW_ORIGIN || 'https://yangmingli.com');
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.end(JSON.stringify(payload));
}

function getSupabaseConfig(env = process.env) {
    const url = String(env.SUPABASE_URL || '').replace(/\/$/, '');
    const serviceRoleKey = String(env.SUPABASE_SERVICE_ROLE_KEY || '');

    if (!url || !serviceRoleKey) {
        const error = new Error('Newsletter database is not configured');
        error.statusCode = 503;
        error.publicMessage = 'Newsletter signup is not available yet. Please try again later.';
        throw error;
    }

    return { url, serviceRoleKey };
}

async function supabaseRequest(path, options = {}, env = process.env) {
    const { url, serviceRoleKey } = getSupabaseConfig(env);
    const response = await fetch(`${url}/rest/v1/${path}`, {
        ...options,
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    const payload = safeJsonParse(text) || text;

    if (!response.ok) {
        const error = new Error(`Supabase request failed with status ${response.status}`);
        error.statusCode = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
}

async function findSubscriberByEmail(email, env = process.env) {
    const encoded = encodeURIComponent(email);
    const rows = await supabaseRequest(
        `${TABLE_NAME}?select=id,email,status&email=eq.${encoded}&limit=1`,
        { method: 'GET' },
        env
    );

    return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function findSubscriberById(id, env = process.env) {
    const encoded = encodeURIComponent(id);
    const rows = await supabaseRequest(
        `${TABLE_NAME}?select=id,email,status&id=eq.${encoded}&limit=1`,
        { method: 'GET' },
        env
    );

    return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function createSubscriber(email, source, env = process.env) {
    const rows = await supabaseRequest(
        `${TABLE_NAME}?select=id,email,status`,
        {
            method: 'POST',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify({
                email,
                status: 'subscribed',
                source
            })
        },
        env
    );

    return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function updateSubscriberStatus(id, status, fields = {}, env = process.env) {
    const encoded = encodeURIComponent(id);
    const rows = await supabaseRequest(
        `${TABLE_NAME}?id=eq.${encoded}&select=id,email,status`,
        {
            method: 'PATCH',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify({
                status,
                ...fields
            })
        },
        env
    );

    return Array.isArray(rows) && rows.length ? rows[0] : null;
}

function getSiteUrl(env = process.env) {
    return String(env.NEWSLETTER_SITE_URL || env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function createUnsubscribeToken(subscriber, secret) {
    if (!secret) {
        throw new Error('Missing NEWSLETTER_SIGNING_SECRET');
    }

    return crypto
        .createHmac('sha256', secret)
        .update(`${subscriber.id}:${normalizeEmail(subscriber.email)}`)
        .digest('base64url');
}

function timingSafeEqualString(left, right) {
    const leftBuffer = Buffer.from(String(left || ''));
    const rightBuffer = Buffer.from(String(right || ''));

    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyUnsubscribeToken(subscriber, token, secret) {
    const expected = createUnsubscribeToken(subscriber, secret);
    return timingSafeEqualString(expected, token);
}

function buildUnsubscribeUrl(subscriber, env = process.env) {
    const token = createUnsubscribeToken(subscriber, env.NEWSLETTER_SIGNING_SECRET);
    const url = new URL('/api/newsletter-unsubscribe', getSiteUrl(env));
    url.searchParams.set('id', subscriber.id);
    url.searchParams.set('token', token);
    return url.toString();
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function stripTags(value) {
    return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function renderNewsletterHtml({ title, intro, posts, unsubscribeUrl, siteUrl = DEFAULT_SITE_URL }) {
    const postItems = (posts || []).map((post) => {
        return [
            '<article style="margin:0 0 24px;padding:0 0 20px;border-bottom:1px solid #e5e7eb;">',
            `<h2 style="margin:0 0 8px;font-size:20px;line-height:1.3;"><a href="${escapeHtml(post.url)}" style="color:#0f766e;text-decoration:none;">${escapeHtml(post.title)}</a></h2>`,
            post.summary ? `<p style="margin:0 0 10px;color:#475569;line-height:1.6;">${escapeHtml(post.summary)}</p>` : '',
            `<p style="margin:0;"><a href="${escapeHtml(post.url)}" style="color:#0f766e;">Read the post</a></p>`,
            '</article>'
        ].join('');
    }).join('');

    return [
        '<!doctype html>',
        '<html><body style="margin:0;padding:0;background:#f8fafc;color:#17202f;font-family:Arial,sans-serif;">',
        '<main style="max-width:680px;margin:0 auto;padding:32px 20px;background:#ffffff;">',
        `<p style="margin:0 0 12px;color:#0f766e;font-weight:700;">Yangming Li's Newsletter</p>`,
        `<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#17202f;">${escapeHtml(title)}</h1>`,
        intro ? `<p style="margin:0 0 24px;color:#475569;line-height:1.7;">${escapeHtml(intro)}</p>` : '',
        postItems || '<p>No new posts were found for this digest.</p>',
        '<footer style="margin-top:32px;padding-top:18px;border-top:1px solid #e5e7eb;color:#64748b;font-size:13px;line-height:1.6;">',
        `<p>You are receiving this because you subscribed to technical blog updates from Yangming Li at <a href="${escapeHtml(siteUrl)}" style="color:#0f766e;">yangmingli.com</a>.</p>`,
        `<p><a href="${escapeHtml(unsubscribeUrl)}" style="color:#0f766e;">Unsubscribe</a> anytime.</p>`,
        '</footer>',
        '</main>',
        '</body></html>'
    ].join('');
}

function renderNewsletterText({ title, intro, posts, unsubscribeUrl }) {
    const lines = [
        "Yangming Li's Newsletter",
        '',
        title,
        '',
        intro || '',
        ''
    ];

    (posts || []).forEach((post) => {
        lines.push(post.title);
        if (post.summary) {
            lines.push(stripTags(post.summary));
        }
        lines.push(post.url, '');
    });

    lines.push('You are receiving this because you subscribed to technical blog updates from Yangming Li.');
    lines.push(`Unsubscribe: ${unsubscribeUrl}`);
    return lines.filter((line, index, all) => line || all[index - 1]).join('\n');
}

async function resendRequest(path, payload, env = process.env, method = 'POST') {
    const apiKey = String(env.RESEND_API_KEY || '');
    if (!apiKey) {
        return { skipped: true, reason: 'RESEND_API_KEY is not configured' };
    }

    const response = await fetch(`https://api.resend.com${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const text = await response.text();
    const data = safeJsonParse(text) || text;

    if (!response.ok) {
        const error = new Error(`Resend request failed with status ${response.status}`);
        error.statusCode = response.status;
        error.payload = data;
        throw error;
    }

    return data;
}

async function syncResendContact(email, unsubscribed, source, env = process.env) {
    if (!env.RESEND_API_KEY) {
        return { skipped: true };
    }

    const body = {
        email,
        unsubscribed,
        properties: {
            source: source || 'website'
        }
    };

    if (env.RESEND_SEGMENT_ID) {
        body.segments = [{ id: env.RESEND_SEGMENT_ID }];
    }

    try {
        return await resendRequest('/contacts', body, env);
    } catch (error) {
        if (error.statusCode === 409) {
            return resendRequest(`/contacts/${encodeURIComponent(email)}`, {
                unsubscribed,
                properties: body.properties
            }, env, 'PATCH');
        }

        throw error;
    }
}

module.exports = {
    TABLE_NAME,
    normalizeEmail,
    isValidEmail,
    sanitizeSource,
    getClientIp,
    hashForLog,
    readRequestBody,
    setJsonHeaders,
    sendJson,
    supabaseRequest,
    findSubscriberByEmail,
    findSubscriberById,
    createSubscriber,
    updateSubscriberStatus,
    getSiteUrl,
    createUnsubscribeToken,
    verifyUnsubscribeToken,
    buildUnsubscribeUrl,
    escapeHtml,
    renderNewsletterHtml,
    renderNewsletterText,
    resendRequest,
    syncResendContact
};
