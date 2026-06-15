#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
    TABLE_NAME,
    supabaseRequest,
    getSiteUrl,
    buildUnsubscribeUrl,
    renderNewsletterHtml,
    renderNewsletterText,
    resendRequest
} = require('../lib/newsletter-core');

function parseArgs(argv) {
    const args = {
        send: false,
        dryRun: true,
        sinceDays: 7,
        limit: 5,
        posts: [],
        subject: '',
        intro: '',
        previewOut: ''
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        const next = argv[index + 1];

        if (arg === '--send') {
            args.send = true;
            args.dryRun = false;
        } else if (arg === '--dry-run') {
            args.send = false;
            args.dryRun = true;
        } else if (arg === '--since-days' && next) {
            args.sinceDays = Number(next);
            index += 1;
        } else if (arg === '--limit' && next) {
            args.limit = Number(next);
            index += 1;
        } else if (arg === '--post' && next) {
            args.posts.push(next);
            index += 1;
        } else if (arg === '--subject' && next) {
            args.subject = next;
            index += 1;
        } else if (arg === '--intro' && next) {
            args.intro = next;
            index += 1;
        } else if (arg === '--preview-out' && next) {
            args.previewOut = next;
            index += 1;
        }
    }

    return args;
}

function decodeXml(value) {
    return String(value || '')
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function readTag(block, tag) {
    const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return match ? decodeXml(match[1]).trim() : '';
}

function stripTags(value) {
    return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function parseRssPosts({ sinceDays, limit, siteUrl }) {
    const rssPath = path.join(process.cwd(), 'rss.xml');
    const xml = fs.readFileSync(rssPath, 'utf8');
    const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    const cutoff = Date.now() - (Number(sinceDays || 7) * 24 * 60 * 60 * 1000);

    return itemBlocks
        .map((block) => {
            const pubDate = readTag(block, 'pubDate');
            const timestamp = pubDate ? Date.parse(pubDate) : 0;
            const link = readTag(block, 'link');

            return {
                title: readTag(block, 'title'),
                url: link.startsWith('http') ? link : new URL(link, siteUrl).toString(),
                summary: stripTags(readTag(block, 'description')),
                pubDate,
                timestamp
            };
        })
        .filter((post) => post.title && post.url)
        .filter((post) => !sinceDays || !post.timestamp || post.timestamp >= cutoff)
        .sort((left, right) => right.timestamp - left.timestamp)
        .slice(0, Number(limit || 5));
}

function readMeta(content, name) {
    const patterns = [
        new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["'][^>]*>`, 'i')
    ];
    const match = patterns.map((pattern) => content.match(pattern)).find(Boolean);
    return match ? decodeXml(match[1]).trim() : '';
}

function resolvePost(input, siteUrl) {
    if (/^https?:\/\//i.test(input)) {
        return {
            title: input,
            url: input,
            summary: ''
        };
    }

    const localPath = path.resolve(process.cwd(), input.replace(/^\//, ''));
    const content = fs.readFileSync(localPath, 'utf8');
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
    const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);

    return {
        title: titleMatch ? decodeXml(titleMatch[1]).replace(/\s*\|\s*Yangming Li\s*$/i, '').trim() : path.basename(input),
        url: canonicalMatch ? decodeXml(canonicalMatch[1]).trim() : new URL(input.replace(/^\//, ''), `${siteUrl}/`).toString(),
        summary: readMeta(content, 'description')
    };
}

async function listSubscribedSubscribers() {
    const rows = await supabaseRequest(
        `${TABLE_NAME}?select=id,email,status&status=eq.subscribed&order=created_at.asc`,
        { method: 'GET' }
    );

    return Array.isArray(rows) ? rows : [];
}

function buildSubject(posts, customSubject) {
    if (customSubject) {
        return customSubject;
    }

    if (posts.length === 1) {
        return `New post: ${posts[0].title}`;
    }

    return `Yangming Li's Newsletter: ${posts.length} new technical notes`;
}

function requireSendEnv() {
    const missing = [];
    ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEWSLETTER_SIGNING_SECRET', 'RESEND_API_KEY', 'NEWSLETTER_FROM'].forEach((name) => {
        if (!process.env[name]) {
            missing.push(name);
        }
    });

    if (missing.length) {
        throw new Error(`Missing required environment variables for sending: ${missing.join(', ')}`);
    }
}

function writePreview(outputBase, html, text) {
    if (!outputBase) {
        return;
    }

    const dir = path.dirname(outputBase);
    if (dir && dir !== '.') {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(`${outputBase}.html`, html);
    fs.writeFileSync(`${outputBase}.txt`, text);
}

async function sendOneEmail({ subscriber, subject, intro, posts, siteUrl }) {
    const unsubscribeUrl = buildUnsubscribeUrl(subscriber);
    const html = renderNewsletterHtml({ title: subject, intro, posts, unsubscribeUrl, siteUrl });
    const text = renderNewsletterText({ title: subject, intro, posts, unsubscribeUrl });
    const payload = {
        from: process.env.NEWSLETTER_FROM,
        to: subscriber.email,
        subject,
        html,
        text
    };

    if (process.env.NEWSLETTER_REPLY_TO) {
        payload.reply_to = process.env.NEWSLETTER_REPLY_TO;
    }

    return resendRequest('/emails', payload);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const siteUrl = getSiteUrl();
    const posts = args.posts.length
        ? args.posts.map((post) => resolvePost(post, siteUrl)).slice(0, args.limit)
        : parseRssPosts({ sinceDays: args.sinceDays, limit: args.limit, siteUrl });
    const subject = buildSubject(posts, args.subject);
    const intro = args.intro || 'A short digest of recent technical writing from yangmingli.com.';
    const previewSubscriber = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'preview@example.com'
    };
    const previewUnsubscribeUrl = process.env.NEWSLETTER_SIGNING_SECRET
        ? buildUnsubscribeUrl(previewSubscriber)
        : `${siteUrl}/api/newsletter-unsubscribe?id=preview&token=preview`;
    const previewHtml = renderNewsletterHtml({ title: subject, intro, posts, unsubscribeUrl: previewUnsubscribeUrl, siteUrl });
    const previewText = renderNewsletterText({ title: subject, intro, posts, unsubscribeUrl: previewUnsubscribeUrl });

    writePreview(args.previewOut, previewHtml, previewText);

    console.log(`Subject: ${subject}`);
    console.log(`Posts: ${posts.length}`);
    posts.forEach((post) => console.log(`- ${post.title} (${post.url})`));

    if (!posts.length) {
        console.log('No posts matched the selected window. Nothing to send.');
        return;
    }

    if (args.dryRun) {
        console.log('Dry run complete. Add --send to send to subscribed readers.');
        return;
    }

    requireSendEnv();
    const subscribers = await listSubscribedSubscribers();
    console.log(`Sending to ${subscribers.length} subscribed readers.`);

    for (const subscriber of subscribers) {
        await sendOneEmail({ subscriber, subject, intro, posts, siteUrl });
        console.log(`Sent to subscriber ${subscriber.id}`);
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
