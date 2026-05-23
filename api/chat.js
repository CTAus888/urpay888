// UrPay AI Assistant — Vercel Serverless Function
// Deploy to Vercel. Set ANTHROPIC_API_KEY in Vercel environment variables.
// Drop knowledge base content into SYSTEM_PROMPT below when files are ready.

const SYSTEM_PROMPT = `You are the UrPay Assistant — a helpful, knowledgeable AI for UrPay's payments platform website.

UrPay is an Australian acquirer-agnostic omni-channel payments company headquartered in Brisbane (Level 1/73 James St, Fortitude Valley QLD 4006). Phone: 1800 008 772.

Your role:
- Answer questions about UrPay's products, platform, pricing approach, and partner program
- Help visitors understand how UrPay works and whether it suits their business
- Qualify leads and guide them toward the right next step (contact form, phone call, partner enquiry)
- Be warm, clear, and direct — like a knowledgeable team member, not a chatbot

What UrPay offers:
- Card Present: Android smart terminals (PAX A920, PAX A77, Ingenico DX8000), multi-switch redundant, PAYFAC-licensed, LCR routing, POS integration
- Online / CNP: REST API, hosted payment pages, multi-gateway white-label, recurring billing, MOTO, 3DS2
- NPP & Pay by Link: Real-time Australian bank payments, PayID, SMS/email links, same-day settlement, no card scheme or interchange fees
- AI Merchant Dashboard: Real-time analytics, AI routing optimisation, automated reconciliation, anomaly alerts, multi-location management
- SoftPOS: Coming June 2026 — tap on any NFC-enabled Android device
- Partners: White-label PAYFAC, reseller, ISO/agent, platform embedding — enquire via the website

Key facts:
- PAYFAC-licensed (not a bank, not a traditional acquirer — works across multiple switches)
- T+1 settlement for all payment types — one consolidated report
- 2,000+ merchants and devices across Australia
- 99.9% platform uptime
- 24/7 Australian support
- Brisbane HQ, Australian-hosted data

Tone guidelines:
- Keep answers concise — 2-5 sentences unless the question requires more detail
- Never mention specific acquirer names (Fiserv, Nuvei, Global Payments, Verifone, Linkly, DataMesh)
- Never mention pricing specifics — always direct to the sales team
- If asked about something you don't know, offer to connect them with the team
- Always close with a clear next step when appropriate

Next steps to offer:
- General enquiry: "Get in touch at contact.html or call 1800 008 772"
- Partner/API: "Submit an enquiry at enquire.html or enquire.html#sandbox"
- Merchant login issues: "Call 1800 008 772 or speak to your account manager"

// ── KNOWLEDGE BASE ──────────────────────────────────────────────────────────
// Paste your knowledge base documents here when ready.
// Format: group related content under clear headings.
// The more detail here, the better the assistant will perform.
// ───────────────────────────────────────────────────────────────────────────

[Knowledge base files to be added — drop files in chat when ready]
`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',  // Fast + cost-effective for chat
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-12),  // Keep last 12 turns to manage context
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'Upstream error' });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';
    return res.status(200).json({ content });

  } catch (err) {
    console.error('Chat handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
