import { processContactSubmission } from '../../../lib/automation';

export async function POST(req) {
  const { lname, fname, email, phone, message } = await req.json();

  try {
    await processContactSubmission({ lname, fname, email, phone, message });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Contact automation failed:', err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
