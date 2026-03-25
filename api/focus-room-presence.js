const SESSION_TTL_MS = 75 * 1000;
const CLEANUP_INTERVAL_MS = 15 * 1000;
const EVENT_WINDOW_MS = 10 * 60 * 1000;

const store = globalThis.__focusRoomPresenceStore || (globalThis.__focusRoomPresenceStore = {
    sessions: new Map(),
    events: [],
    lastCleanupAt: 0
});

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function setJsonHeaders(res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sanitizeSessionId(value) {
    return String(value || '')
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 120);
}

function cleanupSessions(now) {
    if ((now - store.lastCleanupAt) < CLEANUP_INTERVAL_MS && store.sessions.size < 2) {
        return;
    }

    const cutoff = now - SESSION_TTL_MS;

    for (const [sessionId, session] of store.sessions.entries()) {
        if (!session || session.lastSeenAt < cutoff) {
            store.sessions.delete(sessionId);
        }
    }

    store.events = store.events.filter((event) => {
        return !!(event && event.timestamp >= (now - EVENT_WINDOW_MS));
    });

    store.lastCleanupAt = now;
}

function pushEvent(type, now) {
    store.events.push({
        type,
        timestamp: now
    });
}

function buildSnapshot(sessionId, now) {
    const roomSessions = Array.from(store.sessions.entries()).filter(([, session]) => {
        return !!(session && session.present && session.phase === 'room');
    });
    const runningSessions = roomSessions.filter(([, session]) => session.running);
    const writingSessions = roomSessions.filter(([, session]) => session.mode === 'writing');
    const currentSession = sessionId ? store.sessions.get(sessionId) : null;
    const currentInRoom = !!(currentSession && currentSession.present && currentSession.phase === 'room');
    const currentRunning = !!(currentInRoom && currentSession.running);
    const currentWriting = !!(currentInRoom && currentSession.mode === 'writing');
    const count = Math.max(0, roomSessions.length - (currentInRoom ? 1 : 0));
    const activeCount = Math.max(0, runningSessions.length - (currentRunning ? 1 : 0));
    const writingCount = Math.max(0, writingSessions.length - (currentWriting ? 1 : 0));
    const enteredLast10m = store.events.filter((event) => event.type === 'entered').length;
    const recentEvent = [...store.events].reverse().find((event) => {
        return !!(event && (now - event.timestamp) <= (2 * 60 * 1000) && (event.type === 'returned' || event.type === 'entered'));
    });
    const activity = clamp(0.18 + (roomSessions.length * 0.05) + (runningSessions.length * 0.08) + (writingSessions.length * 0.04), 0.18, 0.96);
    const pulseMs = Math.round(clamp(8200 - (roomSessions.length * 160) - (runningSessions.length * 200), 2800, 8200));
    const recentAction = recentEvent
        ? (recentEvent.type === 'returned' ? 'Someone returned to their work' : 'Someone entered the room')
        : (enteredLast10m > 0 ? 'The room filled in quietly' : '');

    return {
        ok: true,
        source: 'live',
        count,
        activeCount,
        writingCount,
        enteredLast10m,
        recentAction,
        activity,
        pulseMs,
        updatedAt: now
    };
}

async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    if (typeof req.body === 'string' && req.body.trim()) {
        return JSON.parse(req.body);
    }

    const chunks = [];

    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }

    if (!chunks.length) {
        return {};
    }

    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
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

    const now = Date.now();
    cleanupSessions(now);

    let body = {};

    try {
        body = await readJsonBody(req);
    } catch (error) {
        res.status(400).json({
            error: 'Invalid JSON body'
        });
        return;
    }

    const sessionId = sanitizeSessionId(body && body.sessionId);

    if (!sessionId) {
        res.status(400).json({
            error: 'Missing sessionId'
        });
        return;
    }

    const present = !!(body && body.present);
    const previousSession = store.sessions.get(sessionId);

    if (!present) {
        if (previousSession && previousSession.present && previousSession.phase === 'room') {
            pushEvent('left', now);
        }

        store.sessions.delete(sessionId);
        cleanupSessions(now);
        res.status(200).json(buildSnapshot(sessionId, now));
        return;
    }

    const nextPhase = body && body.phase === 'room' ? 'room' : 'threshold';
    const nextMode = body && body.mode === 'writing' ? 'writing' : 'focus';
    const nextRunning = !!(body && body.running && nextPhase === 'room');

    if ((!previousSession || !previousSession.present || previousSession.phase !== 'room') && nextPhase === 'room') {
        pushEvent('entered', now);
    } else if (previousSession && previousSession.present && previousSession.phase === 'room' && !previousSession.running && nextRunning) {
        pushEvent('returned', now);
    }

    store.sessions.set(sessionId, {
        lastSeenAt: now,
        phase: nextPhase,
        mode: nextMode,
        running: nextRunning,
        present: true
    });

    cleanupSessions(now);
    res.status(200).json(buildSnapshot(sessionId, now));
};
