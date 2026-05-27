# Deployment Environment Variables

The following environment variables must be provisioned in Vercel (or equivalent host) before the chat widget will function.

| Variable | Used in | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `api/chat.js` | Claude API key for the website chat widget. |
| `DESK365_API_KEY` | `api/desk365.js`, `api/chat.js` | Desk365 API key for ticket creation. Set in Vercel → Project Settings → Environment Variables → Production. If absent or Desk365 unavailable, forms fall back to Formspree automatically. |

**Desk365 API pre-requisite:** Before adding the API key, confirm in Desk365 → Settings → API & Integrations that API access is enabled on the account. All paths currently return an HTML login page until this is activated.
