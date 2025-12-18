import fs from 'fs/promises';
import path from 'path';

const queueDir = path.join(process.cwd(), 'data', 'pushpress-queue');

export async function ensureQueueDir() {
  await fs.mkdir(queueDir, { recursive: true });
}

export async function enqueuePushPress(payload) {
  await ensureQueueDir();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const file = path.join(queueDir, `${id}.json`);
  const record = { id, payload, attempts: 0, createdAt: new Date().toISOString() };
  await fs.writeFile(file, JSON.stringify(record));
  return file;
}

export async function listQueueFiles() {
  try {
    await ensureQueueDir();
    const names = await fs.readdir(queueDir);
    return names.filter((n) => n.endsWith('.json')).map((n) => path.join(queueDir, n));
  } catch (err) {
    return [];
  }
}

export async function readQueueFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function removeQueueFile(filePath) {
  await fs.unlink(filePath).catch(() => {});
}

export async function processQueueOnce(sendFn, options = {}) {
  // sendFn(payload) should attempt delivery and return { ok: boolean }
  const files = await listQueueFiles();
  for (const f of files) {
    try {
      const rec = await readQueueFile(f);
      rec.attempts = (rec.attempts || 0) + 1;
      const res = await sendFn(rec.payload);
      if (res && res.ok) {
        await removeQueueFile(f);
      } else {
        // on non-ok, keep file (could add backoff updates here)
        // Optionally remove after max attempts
        const max = options.maxAttempts || 5;
        if (rec.attempts >= max) {
          await removeQueueFile(f);
          console.error('Dropping queued PushPress payload after max attempts', f);
        } else {
          // update attempts count
          await fs.writeFile(f, JSON.stringify(rec));
        }
      }
    } catch (err) {
      console.error('Error processing queued file', f, err);
    }
  }
}

export default { enqueuePushPress, processQueueOnce, listQueueFiles };
