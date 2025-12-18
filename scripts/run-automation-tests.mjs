import fs from 'fs/promises';
import { processContactSubmission, getContactsFilePath } from '../lib/automation.js';

async function run() {
    const file = getContactsFilePath();
    try {
        await fs.rm(file);
    } catch (e) {
        // ignore if not exists
    }

    const sample = { lname: 'Doe', fname: 'Jane', email: 'jane@example.com', phone: '555-1234', message: 'Hello from test' };

    // Test persistence
    await processContactSubmission(sample);

    const data = await fs.readFile(file, 'utf8');
    const lines = data.trim().split('\n');
    const last = JSON.parse(lines[lines.length - 1]);

    if (last.email !== sample.email || last.fname !== sample.fname) {
        console.error('Automation test failed: persisted data mismatch', { last, sample });
        process.exit(1);
    }

    console.log('Automation test passed — contact persisted to', file);

    // --- PushPress integration test (stub fetch) ---
    const sample2 = { lname: 'Smith', fname: 'Alice', email: 'alice@example.com', phone: '555-9999', message: 'Please follow up' };

    // Stub global.fetch to capture the outgoing request
    const originalFetch = global.fetch;
    let captured = null;
    global.fetch = async (url, opts) => {
        captured = { url, opts };
        return { ok: true, status: 200, text: async () => '' };
    };

    process.env.PUSHPRESS_API_URL = 'https://example.test/pushpress/leads';
    process.env.PUSHPRESS_API_KEY = 'test-key-123';

    await processContactSubmission(sample2);

    // restore fetch
    global.fetch = originalFetch;

    if (!captured) {
        console.error('PushPress test failed: fetch was not called');
        process.exit(1);
    }

    if (captured.url !== process.env.PUSHPRESS_API_URL) {
        console.error('PushPress test failed: URL mismatch', { expected: process.env.PUSHPRESS_API_URL, got: captured.url });
        process.exit(1);
    }

    const body = JSON.parse(captured.opts.body);
    if (body.email !== sample2.email || body.firstName !== sample2.fname) {
        console.error('PushPress test failed: payload mismatch', { body, sample2 });
        process.exit(1);
    }

    console.log('PushPress test passed — outbound lead POST captured to', captured.url);

    // --- Queue retry test: simulate failure so message is enqueued, then process queue ---
    // Stub fetch to simulate failure for initial submit
    let origFetch = global.fetch;
    global.fetch = async () => ({ ok: false, status: 500, text: async () => 'server error' });

    const sample3 = { lname: 'Retry', fname: 'Bob', email: 'bob@example.com', phone: '555-0000', message: 'Retry me' };
    // ensure queue directory empty
    const { listQueueFiles } = await import('../lib/pushpressQueue.js');
    const before = await listQueueFiles();

    await processContactSubmission(sample3);

    const after = await listQueueFiles();
    if ((after.length || 0) <= (before.length || 0)) {
        console.error('Queue test failed: no file enqueued');
        process.exit(1);
    }

    console.log('Queue test: payload was enqueued (files count)', after.length);

    // Now stub fetch to succeed and process the queue
    global.fetch = async () => ({ ok: true, status: 200, text: async () => '' });

    const { default: processQueueRun } = await import('./process-pushpress-queue.mjs');
    await processQueueRun();

    const final = await listQueueFiles();
    if ((final.length || 0) !== 0) {
        console.error('Queue test failed: queued files remain after processing', final);
        process.exit(1);
    }

    console.log('Queue test passed — queued payloads processed and cleared');

    // restore fetch
    global.fetch = origFetch;
}

run().catch((err) => {
    console.error('Automation test runner error:', err);
    process.exit(1);
});
