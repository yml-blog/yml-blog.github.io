const NEWSLETTER_NAME = 'Yangming AI Systems Notes';
const FALLBACK_EMAIL = 'liym1@hotmail.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setJsonHeaders(res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', process.env.NEWSLETTER_ALLOW_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readBody(req) {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    if (typeof req.body === 'string' && req.body.trim()) {
        const contentType = String(req.headers['content-type'] || '').toLowerCase();
        if (contentType.includes('application/x-www-form-urlencoded')) {
            return Object.fromEntries(new URLSearchParams(req.body));
        }
        return JSON.parse(req.body);
    }

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }

    if (!chunks.length) {
        return {};
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('application/x-www-form-urlencoded')) {
        return Object.fromEntries(new URLSearchParams(raw));
    }

    return JSON.parse(raw);
}

function sanitizeText(value, maxLength) {
    return String(value || '')
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function buildMailto(email, source, page) {
    const subject = `Subscribe to ${NEWSLETTER_NAME}`;
    const body = [
        `Please add ${email} to ${NEWSLETTER_NAME}.`,
        '',
        `Source: ${source || 'website'}`,
        `Page: ${page || 'unknown'}`
    ].join('\n');

    return `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function sendWebhook(payload) {
    const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;
    if (!webhookUrl) {
        return false;
    }

    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'yangmingli.com-newsletter'
    };

    if (process.env.NEWSLETTER_WEBHOOK_TOKEN) {
        headers.Authorization = `Bearer ${process.env.NEWSLETTER_WEBHOOK_TOKEN}`;
    }

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Newsletter webhook failed with status ${response.status}`);
    }

    return true;
}

module.exports = async function handler(req, res) {
    setJsonHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed'
        });
        return;
    }

    let body = {};

    try {
        body = await readBody(req);
    } catch (error) {
        res.status(400).json({
            error: 'Invalid subscription request.'
        });
        return;
    }

    const email = sanitizeText(body.email, 254).toLowerCase();
    const source = sanitizeText(body.source, 120);
    const page = sanitizeText(body.page, 500);
    const honeypot = sanitizeText(body.website, 120);

    if (honeypot) {
        res.status(200).json({
            ok: true,
            message: 'Thanks.'
        });
        return;
    }

    if (!EMAIL_PATTERN.test(email)) {
        res.status(400).json({
            error: 'Enter a valid email address.'
        });
        return;
    }

    const payload = {
        email,
        source,
        page,
        newsletter: NEWSLETTER_NAME,
        subscribedAt: new Date().toISOString()
    };

    try {
        const sent = await sendWebhook(payload);

        if (!sent) {
            res.status(503).json({
                error: 'Newsletter backend is not configured yet.',
                fallback: 'mailto',
                mailto: buildMailto(email, source, page)
            });
            return;
        }

        res.status(200).json({
            ok: true,
            message: `You are subscribed to ${NEWSLETTER_NAME}.`
        });
    } catch (error) {
        res.status(502).json({
            error: 'The newsletter service did not accept the request. Please try again later.'
        });
    }
};
