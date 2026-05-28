// TEMPORARY — remove after use
export default async function handler(req, res) {
  const key = process.env.DESK365_API_KEY;
  if (!key) return res.status(500).json({ error: 'No key' });

  const headers = {
    'Authorization': `Bearer ${key}`,
    'Accept': 'application/json',
  };

  const endpoints = ['groups', 'teams', 'agent_groups', 'ticket_groups', 'departments'];
  const results = {};

  await Promise.all(endpoints.map(async (ep) => {
    const r = await fetch(`https://urpay.desk365.io/apis/v3/${ep}`, { headers, signal: AbortSignal.timeout(8000) }).catch(e => ({ ok: false, status: 'timeout' }));
    results[ep] = r.ok ? await r.json() : { error: r.status };
  }));

  res.status(200).json(results);
}
