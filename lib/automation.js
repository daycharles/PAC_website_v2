import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const contactsFile = path.join(dataDir, 'contacts.jsonl');

export async function processContactSubmission(submission) {
    await fs.mkdir(dataDir, { recursive: true });

    const record = {
        ...submission,
        receivedAt: new Date().toISOString(),
    };

    // Persist submission locally (JSON Lines)
    await fs.appendFile(contactsFile, JSON.stringify(record) + '\n');

    // Optional: send notification via Resend if configured. Import dynamically
    // so tests and environments without the package won't fail.
    try {
        if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL && process.env.FROM_EMAIL) {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            const html = `
        <p>New contact submission received:</p>
        <ul>
          <li><strong>Name:</strong> ${submission.fname} ${submission.lname}</li>
          <li><strong>Email:</strong> ${submission.email}</li>
          <li><strong>Phone:</strong> ${submission.phone}</li>
          <li><strong>Message:</strong> ${submission.message}</li>
        </ul>
      `;

            await resend.emails.send({
                from: process.env.FROM_EMAIL,
                to: process.env.NOTIFY_EMAIL,
                subject: `New contact from ${submission.fname} ${submission.lname}`,
                html,
            });
        }
    } catch (err) {
        console.error('Optional Resend notification failed:', err);
    }

    // Optional: send lead to PushPress if configured. Expect environment vars:
    // - PUSHPRESS_API_URL: full URL to POST lead data
    // - PUSHPRESS_API_KEY: optional API key to send as Bearer token
    try {
        if (process.env.PUSHPRESS_API_URL) {
            const pushUrl = process.env.PUSHPRESS_API_URL;
            const headers = { 'Content-Type': 'application/json' };
            if (process.env.PUSHPRESS_API_KEY) {
                headers['Authorization'] = `Bearer ${process.env.PUSHPRESS_API_KEY}`;
            }

            const leadPayload = {
                email: submission.email,
                firstName: submission.fname,
                lastName: submission.lname,
                phone: submission.phone,
                notes: submission.message,
                source: process.env.PUSHPRESS_LEAD_SOURCE || 'website',
            };

            // Use global fetch (Node 18+). If not available, importing 'node-fetch'
            // could be added, but keep this lightweight.
            const fetchFn = global.fetch || (await import('node-fetch')).default;

            const resp = await fetchFn(pushUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(leadPayload),
            });

            if (!resp.ok) {
                const body = await resp.text().catch(() => '<unreadable>');
                console.error('PushPress API returned non-ok response', resp.status, body);
                // enqueue for retry
                const { enqueuePushPress } = await import('../lib/pushpressQueue.js');
                await enqueuePushPress({ url: pushUrl, headers, body: leadPayload });
            }
        }
    } catch (err) {
        console.error('Optional PushPress notification failed:', err);
        try {
            const { enqueuePushPress } = await import('../lib/pushpressQueue.js');
            await enqueuePushPress({ url: process.env.PUSHPRESS_API_URL, headers: { Authorization: process.env.PUSHPRESS_API_KEY ? `Bearer ${process.env.PUSHPRESS_API_KEY}` : undefined, 'Content-Type': 'application/json' }, body: submission });
        } catch (e) {
            console.error('Failed to enqueue PushPress payload after error:', e);
        }
    }

    return { success: true };
}

export function getContactsFilePath() {
    return contactsFile;
}
