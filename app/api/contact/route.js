export async function POST() {
  return new Response(JSON.stringify({ error: 'This service is no longer available.' }), {
    status: 410,
    headers: { 'Content-Type': 'application/json' },
  });
}
