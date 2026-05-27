// GET /api/proposals/:id  (rewritten from /p/:id)
// Serves the tracked proposal page for the given proposal ID

import { spRead, spWrite } from '../../lib/sharepoint.js';
import { updateProposalStatus, addActivityNote } from '../../lib/monday.js';
import { renderProposal } from '../../lib/template.js';

const SP_BASE    = 'Claude/Sales/Proposals';
const META_PIXEL = process.env.META_PIXEL_ID || '';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id || !/^[a-f0-9]{12}$/.test(id)) {
    return res.status(404).send(notFoundPage());
  }

  // Fetch proposal from SharePoint
  let proposal;
  try {
    proposal = await spRead(`${SP_BASE}/${id}.json`);
  } catch {
    return res.status(404).send(notFoundPage());
  }
  if (!proposal) return res.status(404).send(notFoundPage());

  // Log view event (non-blocking)
  const viewEvent = {
    type:      'view',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || '',
    ip:        req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '',
    viewCount: (proposal.views?.length || 0) + 1,
  };
  const isFirstView = !proposal.views?.length;

  try {
    proposal.views = [...(proposal.views || []), viewEvent];
    await spWrite(`${SP_BASE}/${id}.json`, proposal);

    if (proposal.mondayItemId) {
      const count = proposal.views.length;
      await updateProposalStatus(proposal.mondayItemId, 'view');
      await addActivityNote(
        proposal.mondayItemId,
        `Proposal ${isFirstView ? 'opened for the first time' : `opened again (×${count} total)`} — ` +
        `${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} AEST · ` +
        `${isMobile(viewEvent.userAgent) ? 'Mobile' : 'Desktop'}`
      );
    }
  } catch (err) {
    console.error('[proposals/view] Track failed:', err.message);
  }

  // Render and serve the proposal HTML
  const html = renderProposal(proposal, { metaPixelId: META_PIXEL });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(html);
}

function isMobile(ua = '') {
  return /Mobile|Android|iPhone|iPad/i.test(ua);
}

function notFoundPage() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>UrPay</title>
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;
  min-height:100vh;margin:0;background:#0B1029;color:#fff;}
  .box{text-align:center;}h1{font-size:2em;color:#8D8DFF;margin-bottom:8px;}
  a{color:#1ED69A;}</style></head>
  <body><div class="box"><h1>UrPay</h1>
  <p>This proposal link is no longer active.</p>
  <p style="margin-top:16px;"><a href="https://www.urpay.com.au">Visit urpay.com.au</a></p>
  </div></body></html>`;
}
