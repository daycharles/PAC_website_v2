import { processQueueOnce } from '../lib/pushpressQueue.js';

// sendFn receives payload { url, headers, body } and performs the POST
async function sendFn(payload) {
  const fetchFn = global.fetch || (await import('node-fetch')).default;
  try {
    const resp = await fetchFn(payload.url, {
      method: 'POST',
      headers: payload.headers,
      body: JSON.stringify(payload.body),
    });
    return { ok: resp.ok, status: resp.status };
  } catch (err) {
    console.error('sendFn error:', err);
    return { ok: false };
  }
}

async function run() {
  await processQueueOnce(sendFn, { maxAttempts: 5 });
}

if (import.meta.url === `file://${process.cwd().replace(/\\/g, '/')}/scripts/process-pushpress-queue.mjs`) {
  run().catch((err) => {
    console.error('Queue processor error:', err);
    process.exit(1);
  });
}

export default run;
