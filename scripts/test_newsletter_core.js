const test = require('node:test');
const assert = require('node:assert/strict');

const {
    normalizeEmail,
    isValidEmail,
    createUnsubscribeToken,
    verifyUnsubscribeToken,
    buildUnsubscribeUrl,
    renderNewsletterHtml,
    renderNewsletterText
} = require('../lib/newsletter-core');

test('normalizes and validates email addresses', () => {
    assert.equal(normalizeEmail('  Reader@Example.COM '), 'reader@example.com');
    assert.equal(isValidEmail('reader@example.com'), true);
    assert.equal(isValidEmail('reader@example'), false);
    assert.equal(isValidEmail('reader..name@example.com'), false);
});

test('creates and verifies unsubscribe tokens', () => {
    const subscriber = {
        id: '9b5b5d4f-4374-45ee-b7d1-e3a69a3f6d59',
        email: 'reader@example.com'
    };
    const secret = 'test-secret';
    const token = createUnsubscribeToken(subscriber, secret);

    assert.equal(verifyUnsubscribeToken(subscriber, token, secret), true);
    assert.equal(verifyUnsubscribeToken(subscriber, `${token}x`, secret), false);
});

test('builds unsubscribe URLs and includes them in email templates', () => {
    const subscriber = {
        id: '9b5b5d4f-4374-45ee-b7d1-e3a69a3f6d59',
        email: 'reader@example.com'
    };
    const env = {
        NEWSLETTER_SITE_URL: 'https://example.com',
        NEWSLETTER_SIGNING_SECRET: 'test-secret'
    };
    const unsubscribeUrl = buildUnsubscribeUrl(subscriber, env);
    const posts = [{
        title: 'A technical post',
        url: 'https://example.com/post.html',
        summary: 'A short summary.'
    }];
    const html = renderNewsletterHtml({
        title: 'Digest',
        intro: 'Hello',
        posts,
        unsubscribeUrl,
        siteUrl: 'https://example.com'
    });
    const text = renderNewsletterText({
        title: 'Digest',
        intro: 'Hello',
        posts,
        unsubscribeUrl
    });

    assert.match(unsubscribeUrl, /^https:\/\/example\.com\/api\/newsletter-unsubscribe\?/);
    assert.match(html, /Unsubscribe/);
    assert.match(html, /A technical post/);
    assert.match(text, /Unsubscribe:/);
});
