// TEMPORARY — remove after use
export default async function handler(req, res) {
  const key = process.env.DESK365_API_KEY;
  if (!key) return res.status(500).json({ error: 'No key' });

  const headers = {
    'Authorization': `Bearer ${key}`,
    'Accept': 'application/json',
  };

  const [deptResp, agentsResp] = await Promise.all([
    fetch('https://urpay.desk365.io/apis/v3/departments', { headers, signal: AbortSignal.timeout(10000) }),
    fetch('https://urpay.desk365.io/apis/v3/agents', { headers, signal: AbortSignal.timeout(10000) }),
  ]);

  const departments = deptResp.ok ? await deptResp.json() : { error: deptResp.status };
  const agents = agentsResp.ok ? await agentsResp.json() : { error: agentsResp.status };

  res.status(200).json({ departments, agents });
}
