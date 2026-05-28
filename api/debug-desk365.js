// TEMPORARY — remove after use
export default async function handler(req, res) {
  const key = process.env.DESK365_API_KEY;
  if (!key) return res.status(500).json({ error: 'No key' });

  const headers = {
    'Authorization': `Bearer ${key}`,
    'Accept': 'application/json',
  };

  const [groupsResp, agentsResp] = await Promise.all([
    fetch('https://urpay.desk365.io/apis/v3/groups', { headers, signal: AbortSignal.timeout(10000) }),
    fetch('https://urpay.desk365.io/apis/v3/agents', { headers, signal: AbortSignal.timeout(10000) }),
  ]);

  const groups = groupsResp.ok ? await groupsResp.json() : { error: groupsResp.status };
  const agents = agentsResp.ok ? await agentsResp.json() : { error: agentsResp.status };

  res.status(200).json({ groups, agents });
}
