// UrPay — Desk365 ticket creation endpoint
// Handles contact/partner/dev form submissions → Desk365 ticket, Formspree fallback, Monday.com lead
// Deploy to Vercel. Set DESK365_API_KEY + MONDAY_API_KEY in Vercel environment variables.

import { createInboundLead } from '../lib/monday.js';

const DESK365_BASE = 'https://urpay.desk365.io/apis/v3';

const FORMSPREE = {
  contact: 'https://formspree.io/f/mbdbkpzp',
  partner: 'https://formspree.io/f/xnjrzogl',
  dev:     'https://formspree.io/f/xvzyqvda',
};

// priority: 1=Urgent, 5=High, 10=Medium, 20=Low
const GROUPS = {
  sales:    { label: 'Sales',                priority: 10 },
  terminal: { label: 'Terminal Support',     priority: 5  },
  gateway:  { label: 'Gateway Support',      priority: 10 },
  billing:  { label: 'Settlement & Accounts',priority: 10 },
  partner:  { label: 'Partnerships',         priority: 10 },
  general:  { label: 'General Enquiry',      priority: 20 },
};

async function tryDesk365(apiKey, ticket) {
  const resp = await fetch(`${DESK365_BASE}/tickets/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(ticket),
    signal: AbortSignal.timeout(8000),
  });
  const ct = resp.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`Desk365 returned non-JSON (HTTP ${resp.status})`);
  }
  const data = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function tryFormspree(url, payload) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!resp.ok) throw new Error(`Formspree HTTP ${resp.status}`);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const formType = req.query.type || 'contact'; // contact | partner | dev
  const body = req.body || {};

  // Resolve group
  let groupKey = 'general';
  if (formType === 'partner') {
    groupKey = 'partner';
  } else if (formType === 'dev') {
    groupKey = 'gateway';
  } else if (formType === 'joe') {
    groupKey = 'sales';
  } else if (body.enquiry_type && GROUPS[body.enquiry_type]) {
    groupKey = body.enquiry_type;
  }
  const group = GROUPS[groupKey];

  // Build contact fields
  const name     = [body.first_name, body.last_name].filter(Boolean).join(' ') || body.name || 'Website visitor';
  const email    = body.email || '';
  const emailForTicket = email || 'noreply@urpay.com.au';
  const phone    = body.phone || '';
  const business = body.business_name || body.company || '';
  const message  = body.message || '';

  const subject = `${group.label}: ${name}${business ? ' (' + business + ')' : ''}`;
  const description = [
    `Source: UrPay website — ${formType} form`,
    `Name: ${name}`,
    phone    && `Phone: ${phone}`,
    business && `Business: ${business}`,
    `Email: ${email}`,
    `Topic: ${group.label}`,
    '',
    message,
  ].filter(Boolean).join('\n');

  // Try Desk365 first
  const apiKey = process.env.DESK365_API_KEY;
  let via = null;

  if (apiKey) {
    try {
      await tryDesk365(apiKey, {
        subject,
        description,
        email: emailForTicket,
        status: 'Open',
        priority: group.priority,
        type: 'Question',
      });
      via = 'desk365';
    } catch (err) {
      console.error('[desk365] Ticket creation failed:', err.message);
    }
  }

  // Formspree fallback — always fires if Desk365 unavailable
  if (!via) {
    const fsUrl = FORMSPREE[formType] || FORMSPREE.contact;
    try {
      await tryFormspree(fsUrl, {
        name, email: emailForTicket, phone, business, message,
        enquiry_type: groupKey,
        _subject: subject,
        _replyto: emailForTicket,
      });
      via = 'formspree';
    } catch (err) {
      console.error('[desk365] Formspree fallback failed:', err.message);
      return res.status(500).json({ error: 'Submission failed. Please call 1800 008 772.' });
    }
  }

  // Monday.com — create inbound lead (non-blocking, never delays response)
  createInboundLead({
    name, email, phone, business,
    formType,
    groupLabel: group.label,
    message,
  }).catch(err => console.error('[desk365] Monday lead creation failed:', err.message));

  return res.status(200).json({ ok: true, via });
}
