// POST /api/proposals/track
// Body: { id, event }  — event: 'pdf_download' | 'cta_click'
// Called by the proposal page JS for explicit user actions

import { spRead, spWrite } from '../../lib/sharepoint.js';
import { updateProposalStatus, addActivityNote } from '../../lib/monday.js';

const SP_BASE = 'Claude/Sales/Proposals';

const EVENT_LABELS = {
  pdf_download: 'PDF Downloaded',
  cta_click:    'CTA Clicked — Enquire Now',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { id, event } = req.body || {};
  if (!id || !EVENT_LABELS[event]) return res.status(400).json({ error: 'Invalid request' });

  try {
    const proposal = await spRead(`${SP_BASE}/${id}.json`);
    if (!proposal) return res.status(404).json({ error: 'Not found' });

    const entry = {
      type:      event,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || '',
    };
    proposal.views = [...(proposal.views || []), entry];
    await spWrite(`${SP_BASE}/${id}.json`, proposal);

    if (proposal.mondayItemId) {
      await updateProposalStatus(proposal.mondayItemId, event);
      await addActivityNote(
        proposal.mondayItemId,
        `${EVENT_LABELS[event]} — ` +
        new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }) + ' AEST'
      );
    }
  } catch (err) {
    console.error('[proposals/track] Error:', err.message);
  }

  return res.status(200).json({ ok: true });
}
