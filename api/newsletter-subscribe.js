const {
    normalizeEmail,
    isValidEmail,
    sanitizeSource,
    getClientIp,
    hashForLog,
    readRequestBody,
    setJsonHeaders,
    sendJson,
    findSubscriberByEmail,
    createSubscriber,
    updateSubscriberStatus,
    syncResendContact
} = require('../lib/newsletter-core');

const RATE_LIMIT_WINDOW_MS = Number(process.env.NEWSLETTER_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const RATE_LIMIT_MAX = Number(process.env.NEWSLETTER_RATE_LIMIT_MAX || 8);

const rateLimitStore = globalThis.__newsletterRateLimitStore || (globalThis.__newsletterRateLimitStore = {
    hits: new Map(),
    lastCleanupAt: 0
});

function cleanupRateLimit(now) {
    if ((now - rateLimitStore.lastCleanupAt) < RATE_LIMIT_WINDOW_MS) {
        return;
    }

    for (const [key, timestamps] of rateLimitStore.hits.entries()) {
        const fresh = timestamps.filter((timestamp) => (now - timestamp) < RATE_LIMIT_WINDOW_MS);
        if (fresh.length) {
            rateLimitStore.hits.set(key, fresh);
        } else {
            rateLimitStore.hits.delete(key);
        }
    }

    rateLimitStore.lastCleanupAt = now;
}

function isRateLimited(key, now) {
    cleanupRateLimit(now);

    const timestamps = rateLimitStore.hits.get(key) || [];
    const fresh = timestamps.filter((timestamp) => (now - timestamp) < RATE_LIMIT_WINDOW_MS);
    fresh.push(now);
    rateLimitStore.hits.set(key, fresh);
    return fresh.length > RATE_LIMIT_MAX;
}

async function syncContactSafely(email, unsubscribed, source) {
    try {
        await syncResendContact(email, unsubscribed, source);
    } catch (error) {
        console.error('newsletter_resend_sync_failed', {
            emailHash: hashForLog(email),
            statusCode: error.statusCode || 500
        });
    }
}

module.exports = async function handler(req, res) {
    setJsonHeaders(res);

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        sendJson(res, 405, {
            ok: false,
            code: 'method_not_allowed',
            message: 'Method not allowed. Use POST.'
        });
        return;
    }

    let body;
    try {
        body = await readRequestBody(req);
    } catch (error) {
        sendJson(res, error.statusCode || 400, {
            ok: false,
            code: 'invalid_request',
            message: 'Invalid request body.'
        });
        return;
    }

    const now = Date.now();
    const ip = getClientIp(req);
    const email = normalizeEmail(body.email);
    const source = sanitizeSource(body.source || body.page || req.headers.referer || 'website');
    const honeypot = String(body.website || '').trim();

    if (isRateLimited(`ip:${ip}`, now)) {
        sendJson(res, 429, {
            ok: false,
            code: 'rate_limited',
            message: 'Too many signup attempts. Please wait a few minutes and try again.'
        });
        return;
    }

    if (honeypot) {
        sendJson(res, 200, {
            ok: true,
            status: 'received',
            message: 'Thanks - please check your email to confirm your subscription.'
        });
        return;
    }

    if (!isValidEmail(email)) {
        sendJson(res, 400, {
            ok: false,
            code: 'invalid_email',
            message: 'Please enter a valid email address.'
        });
        return;
    }

    if (isRateLimited(`email:${email}`, now)) {
        sendJson(res, 429, {
            ok: false,
            code: 'rate_limited',
            message: 'Too many signup attempts for this address. Please try again later.'
        });
        return;
    }

    try {
        const existing = await findSubscriberByEmail(email);

        if (existing && existing.status !== 'unsubscribed') {
            sendJson(res, 200, {
                ok: true,
                status: 'already_subscribed',
                message: 'You are already subscribed. Thanks for reading.'
            });
            return;
        }

        const subscriber = existing
            ? await updateSubscriberStatus(existing.id, 'subscribed', {
                source,
                unsubscribed_at: null
            })
            : await createSubscriber(email, source);

        await syncContactSafely(email, false, source);

        sendJson(res, 200, {
            ok: true,
            status: existing ? 'resubscribed' : 'subscribed',
            message: existing
                ? 'You are subscribed again. Thanks for reading.'
                : 'Thanks - you are subscribed to future technical blog updates.'
        });
    } catch (error) {
        if (error.statusCode === 409 || (error.payload && error.payload.code === '23505')) {
            sendJson(res, 200, {
                ok: true,
                status: 'already_subscribed',
                message: 'You are already subscribed. Thanks for reading.'
            });
            return;
        }

        console.error('newsletter_subscribe_failed', {
            emailHash: hashForLog(email),
            statusCode: error.statusCode || 500
        });

        sendJson(res, error.publicMessage ? (error.statusCode || 503) : 500, {
            ok: false,
            code: error.publicMessage ? 'not_configured' : 'server_error',
            message: error.publicMessage || 'Subscription request failed. Please try again later.'
        });
    }
};
