// TEMPORARY — remove after use
export default async function handler(req, res) {
  const key = process.env.DESK365_API_KEY;
  if (!key) return res.status(500).json({ error: 'No key' });

  const headers = {
    'Authorization': `Bearer ${key}`,
    'Accept': 'application/json',
  };

  const [ticketsResp, agentsResp] = await Promise.all([
    fetch('https://urpay.desk365.io/apis/v3/tickets?page=56&page_size=25', { headers, signal: AbortSignal.timeout(10000) }),
    fetch('https://urpay.desk365.io/apis/v3/agents', { headers, signal: AbortSignal.timeout(10000) }),
  ]);

  const ticketsRaw = ticketsResp.ok ? await ticketsResp.json() : { error: ticketsResp.status };
  const agents = agentsResp.ok ? await agentsResp.json() : { error: agentsResp.status };

  // Summarise: ticket id, subject, group, status, created_at
  const tickets = Array.isArray(ticketsRaw?.content)
    ? ticketsRaw.content.map(t => ({
        id: t.ticket_id || t.id,
        subject: t.subject,
        group: t.group,
        status: t.status,
        created: t.created_at,
      }))
    : ticketsRaw;

  res.status(200).json({ tickets, agents });
}
