// SharePoint / Microsoft Graph API helpers
// Credentials: SHAREPOINT_CLIENT_ID, SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_DRIVE_ID

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function getToken() {
  const resp = await fetch(
    `https://login.microsoftonline.com/${process.env.SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.SHAREPOINT_CLIENT_ID,
        client_secret: process.env.SHAREPOINT_CLIENT_SECRET,
        scope:         'https://graph.microsoft.com/.default',
        grant_type:    'client_credentials',
      }),
      signal: AbortSignal.timeout(8000),
    }
  );
  const data = await resp.json();
  if (!data.access_token) throw new Error(`Graph token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

export async function spWrite(path, content) {
  const token   = await getToken();
  const driveId = process.env.SHAREPOINT_DRIVE_ID;
  const body    = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  const resp = await fetch(
    `${GRAPH}/drives/${driveId}/root:/${path}:/content`,
    {
      method:  'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`spWrite failed (${resp.status}): ${err}`);
  }
  return resp.json();
}

export async function spRead(path) {
  const token   = await getToken();
  const driveId = process.env.SHAREPOINT_DRIVE_ID;
  const resp = await fetch(
    `${GRAPH}/drives/${driveId}/root:/${path}:/content`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!resp.ok) return null;
  return resp.json();
}

export async function spAppend(path, newEntry) {
  const existing = await spRead(path) || { entries: [] };
  existing.entries.push(newEntry);
  await spWrite(path, existing);
}
