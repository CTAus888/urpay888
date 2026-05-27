// POST /api/proposals/create
// Body: { pin, merchantName, businessType, template, customRate, salesperson }
// Returns: { id, url }

import { spWrite } from '../../lib/sharepoint.js';
import { createProposalItem } from '../../lib/monday.js';

const VALID_TEMPLATES = ['complete-solution', 'terminal-proposal'];
const SP_BASE = 'Claude/Sales/Proposals';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pin, merchantName, businessType, template, customRate, salesperson } = req.body || {};

  // PIN check
  if (pin !== process.env.PROPOSAL_PIN) {
    return res.status(401).json({ error: 'Invalid PIN' });
  }

  // Validation
  if (!merchantName?.trim()) return res.status(400).json({ error: 'Merchant name required' });
  if (!VALID_TEMPLATES.includes(template)) return res.status(400).json({ error: 'Invalid template' });

  // Generate unique ID
  const id  = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const url = `${process.env.SITE_URL || 'https://www.urpay.com.au'}/p/${id}`;
  const now = new Date().toISOString();

  const proposal = {
    id,
    url,
    merchantName:  merchantName.trim(),
    businessType:  businessType || 'General',
    template,
    customRate:    customRate?.trim() || null,
    salesperson:   salesperson?.trim() || 'UrPay Team',
    createdAt:     now,
    mondayItemId:  null,
    views:         [],
  };

  // Save to SharePoint (non-blocking on failure — log only)
  try {
    await spWrite(`${SP_BASE}/${id}.json`, proposal);
  } catch (err) {
    console.error('[proposals/create] SharePoint save failed:', err.message);
  }

  // Create Monday.com item (non-blocking)
  try {
    const mondayId = await createProposalItem({
      merchantName:  proposal.merchantName,
      businessType:  proposal.businessType,
      template,
      customRate:    proposal.customRate,
      salesperson:   proposal.salesperson,
      proposalUrl:   url,
    });
    if (mondayId) {
      proposal.mondayItemId = mondayId;
      await spWrite(`${SP_BASE}/${id}.json`, proposal);
    }
  } catch (err) {
    console.error('[proposals/create] Monday.com item creation failed:', err.message);
  }

  return res.status(200).json({ id, url });
}
