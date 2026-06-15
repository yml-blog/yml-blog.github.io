const {
    hashForLog,
    readRequestBody,
    setJsonHeaders,
    sendJson,
    findSubscriberById,
    updateSubscriberStatus,
    verifyUnsubscribeToken,
    syncResendContact,
    escapeHtml
} = require('../lib/newsletter-core');

function readQuery(req) {
    const url = new URL(req.url || '', 'https://yangmingli.com');
    return {
        id: url.searchParams.get('id') || '',
        token: url.searchParams.get('token') || ''
    };
}

function wantsHtml(req) {
    return req.method === 'GET' && !String(req.headers.accept || '').includes('application/json');
}

function sendHtml(res, statusCode, title, message) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Yangming Li</title>
<style>
body{margin:0;background:#f8fafc;color:#17202f;font-family:Arial,sans-serif}
main{max-width:640px;margin:10vh auto;padding:32px 24px;background:#fff;border:1px solid #d9e2ec;border-radius:8px}
a{color:#0f766e}
</style>
</head>
<body>
<main>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(message)}</p>
<p><a href="/">Return to yangmingli.com</a></p>
</main>
</body>
</html>`);
}

async function syncUnsubscribeSafely(email) {
    try {
        await syncResendContact(email, true, 'unsubscribe');
    } catch (error) {
        console.error('newsletter_resend_unsubscribe_sync_failed', {
            emailHash: hashForLog(email),
            statusCode: error.statusCode || 500
        });
    }
}

module.exports = async function handler(req, res) {
    setJsonHeaders(res, 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        sendJson(res, 405, {
            ok: false,
            code: 'method_not_allowed',
            message: 'Method not allowed.'
        });
        return;
    }

    let body = {};
    if (req.method === 'POST') {
        try {
            body = await readRequestBody(req);
        } catch (error) {
            sendJson(res, 400, {
                ok: false,
                code: 'invalid_request',
                message: 'Invalid request body.'
            });
            return;
        }
    }

    const query = readQuery(req);
    const id = String(body.id || query.id || '').trim();
    const token = String(body.token || query.token || '').trim();

    if (!id || !token) {
        const message = 'This unsubscribe link is missing required information.';
        if (wantsHtml(req)) {
            sendHtml(res, 400, 'Invalid unsubscribe link', message);
        } else {
            sendJson(res, 400, { ok: false, code: 'invalid_link', message });
        }
        return;
    }

    try {
        const subscriber = await findSubscriberById(id);
        if (!subscriber || !verifyUnsubscribeToken(subscriber, token, process.env.NEWSLETTER_SIGNING_SECRET)) {
            const message = 'This unsubscribe link is invalid or expired.';
            if (wantsHtml(req)) {
                sendHtml(res, 400, 'Invalid unsubscribe link', message);
            } else {
                sendJson(res, 400, { ok: false, code: 'invalid_link', message });
            }
            return;
        }

        if (subscriber.status !== 'unsubscribed') {
            await updateSubscriberStatus(subscriber.id, 'unsubscribed', {
                unsubscribed_at: new Date().toISOString()
            });
            await syncUnsubscribeSafely(subscriber.email);
        }

        const message = 'You have been unsubscribed from future technical blog update emails.';
        if (wantsHtml(req)) {
            sendHtml(res, 200, 'Unsubscribed', message);
        } else {
            sendJson(res, 200, {
                ok: true,
                status: 'unsubscribed',
                message
            });
        }
    } catch (error) {
        console.error('newsletter_unsubscribe_failed', {
            idHash: hashForLog(id),
            statusCode: error.statusCode || 500
        });

        const message = error.publicMessage || 'Unsubscribe request failed. Please try again later.';
        if (wantsHtml(req)) {
            sendHtml(res, error.statusCode || 500, 'Unsubscribe failed', message);
        } else {
            sendJson(res, error.statusCode || 500, {
                ok: false,
                code: error.publicMessage ? 'not_configured' : 'server_error',
                message
            });
        }
    }
};
