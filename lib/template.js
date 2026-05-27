// Proposal HTML renderer
// renderProposal(proposal, options) → full HTML string served to merchant

const BASE_URL = 'https://www.urpay.com.au';
const IMG      = `${BASE_URL}/images/proposals`;

const TEMPLATES = {
  'complete-solution': {
    title:        'Complete Payments Solution',
    coverEyebrow: 'Merchant Payments Proposal',
    coverHead:    (m) => `The Complete<br>Payments <span>Solution</span><br>for ${m}`,
    coverSub:     'POS integration, in-store terminals, online payments and NPP — one platform, one provider, zero complexity.',
    coverPills:   ['Free Hardware', 'No Lock-In Contracts', 'Next-Day Settlement', '24/7 Support', 'Hospitality & Retail'],
    heroImg:      `${IMG}/hero-payment.jpg`,
    lifestyleImg: `${IMG}/cafe-payment.jpg`,
    solutionImg:  `${IMG}/retail-tap.jpg`,
    cnpImg:       `${IMG}/phone-nfc.jpg`,
    whyTitle:     'Built for businesses<br>that take payments <span>seriously</span>',
    whySub:       'Most payment providers give you a terminal and walk away. UrPay gives you a complete payments infrastructure — in-store, online, and everything in between — backed by a team that picks up the phone.',
    solSub:       'From tableside tap-to-pay to phone orders and online sales at midnight — UrPay handles every payment scenario in one unified platform.',
  },
  'terminal-proposal': {
    title:        'Terminal Payments Proposal',
    coverEyebrow: 'Merchant Payments Proposal',
    coverHead:    (m) => `Accept Every<br>Payment. <span>Every</span><br>Way They Pay.`,
    coverSub:     'EFTPOS terminals, online payments, Pay by Link, and NPP — all on one account. No monthly fees, no lock-in, free hardware.',
    coverPills:   ['Free Hardware', 'No Monthly Fees', 'Next-Day Settlement', 'No Lock-In Contracts', 'Hospitality & Retail'],
    heroImg:      `${IMG}/hero-payment.jpg`,
    lifestyleImg: `${IMG}/hospitality.jpg`,
    solutionImg:  `${IMG}/card-tap.jpg`,
    cnpImg:       `${IMG}/cafe-payment.jpg`,
    whyTitle:     'Payments without the<br>complexity or the <span>fees</span>',
    whySub:       'Most payment providers charge monthly fees, lock you into 24-month contracts, and disappear after setup. UrPay gives you premium hardware, transparent rates, and a local support team.',
    solSub:       'From a busy counter doing 200 taps a day to phone orders taken between services — UrPay handles every payment scenario in one unified account.',
  },
};

export function renderProposal(proposal, { metaPixelId = '' } = {}) {
  const t    = TEMPLATES[proposal.template] || TEMPLATES['complete-solution'];
  const rate = proposal.customRate ? `From ${proposal.customRate}` : 'From 1.4%';
  const m    = proposal.merchantName || 'Your Business';

  const trackingScript = `
<script>
(function(){
  const ID='${proposal.id}';
  fetch('/api/proposals/track',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:ID,event:'view'})}).catch(()=>{});
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-track]');
    if(t) fetch('/api/proposals/track',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:ID,event:t.dataset.track})}).catch(()=>{});
  });
  window.addEventListener('beforeprint',function(){
    fetch('/api/proposals/track',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:ID,event:'pdf_download'})}).catch(()=>{});
  });
})();
</script>`;

  const pixel = metaPixelId ? `
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${metaPixelId}');
fbq('track','PageView');
fbq('trackCustom','ProposalViewed',{merchant:'${m.replace(/'/g,"\\'")}',template:'${proposal.template}'});
</script>` : '';

  const pills = t.coverPills.map(p =>
    `<span class="cover-pill${p.startsWith('Free') || p.startsWith('No Monthly') ? ' green' : ''}">${p}</span>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>UrPay — ${t.title} — ${m}</title>
${pixel}
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;font-size:10pt;color:#1a1a1a;background:#fff}
/* ── Sticky CTA bar ── */
.sticky-bar{position:fixed;top:0;left:0;right:0;z-index:999;background:#0B1029;
  display:flex;justify-content:space-between;align-items:center;padding:8px 20px;
  border-bottom:1px solid rgba(141,141,255,0.2);}
.sticky-bar-merchant{font-size:8.5pt;color:#aac0e0;font-weight:500}
.sticky-bar-merchant strong{color:#fff}
.sticky-bar-actions{display:flex;gap:10px}
.btn-primary{background:#8D8DFF;color:#fff;border:none;border-radius:20px;padding:6px 16px;
  font-family:'DM Sans',sans-serif;font-size:8pt;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block}
.btn-outline{background:transparent;color:#8D8DFF;border:1px solid rgba(141,141,255,0.4);border-radius:20px;
  padding:6px 16px;font-family:'DM Sans',sans-serif;font-size:8pt;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block}
/* ── Print / PDF ── */
@media print{.sticky-bar,.no-print{display:none!important}.page{page-break-after:always;padding:14mm 16mm 12mm 16mm}
  body{font-size:10pt}.page:last-child{page-break-after:auto}}
@media screen{.page{padding:18mm 18mm 14mm 18mm;max-width:800px;margin:0 auto}
  body{padding-top:40px;background:#f4f5f8}
  .page{background:#fff;margin-bottom:24px;border-radius:8px;box-shadow:0 2px 16px rgba(0,0,0,0.08)}}
/* ── Cover ── */
.cover{background:#0B1029;color:#fff;min-height:267mm;display:flex;flex-direction:row;overflow:hidden;border-radius:8px}
.cover-left{flex:0 0 57%;padding:18mm 14mm 14mm 16mm;display:flex;flex-direction:column;justify-content:space-between}
.cover-right{flex:0 0 43%;position:relative;overflow:hidden}
.cover-right img{width:100%;height:100%;object-fit:cover;object-position:center 25%;display:block}
.cover-right-fade{position:absolute;top:0;left:0;width:80px;height:100%;background:linear-gradient(90deg,#0B1029,transparent)}
.cover-logo{font-family:'DM Sans',sans-serif;font-size:17pt;font-weight:700;color:#fff;letter-spacing:.02em;margin-bottom:10px}
.cover-eyebrow{font-size:8pt;font-weight:600;color:#8D8DFF;letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px}
.cover-headline{font-family:'Playfair Display',serif;font-style:italic;font-weight:900;font-size:34pt;line-height:1.08;color:#fff;margin-bottom:14px}
.cover-headline span{color:#8D8DFF}
.cover-sub{font-size:10pt;font-weight:300;color:#aac0e0;line-height:1.65;margin-bottom:22px}
.cover-pills{display:flex;flex-wrap:wrap;gap:7px}
.cover-pill{background:rgba(141,141,255,.12);border:1px solid rgba(141,141,255,.3);border-radius:20px;padding:5px 13px;font-size:7.5pt;color:#c5d3f8;font-weight:500}
.cover-pill.green{background:rgba(30,214,154,.12);border-color:rgba(30,214,154,.3);color:#1ED69A}
.cover-footer{border-top:1px solid rgba(255,255,255,.1);padding-top:11px;display:flex;justify-content:space-between;font-size:7.5pt;color:#666d8a;line-height:1.5}
/* ── Section pages ── */
.page-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:9px;border-bottom:2px solid #0B1029;margin-bottom:16px}
.page-header-brand{font-size:8.5pt;font-weight:700;color:#0B1029;letter-spacing:.04em}
.page-header-section{font-size:7.5pt;color:#8D8DFF;font-weight:600;letter-spacing:.1em;text-transform:uppercase}
.page-footer{margin-top:auto;padding-top:9px;border-top:1px solid #e8edf6;display:flex;justify-content:space-between;font-size:7pt;color:#aaa}
.section-eyebrow{font-size:7.5pt;font-weight:700;color:#8D8DFF;letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px}
.section-title{font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:22pt;color:#0B1029;line-height:1.15;margin-bottom:5px}
.section-title span{color:#8D8DFF}
.section-sub{font-size:9pt;color:#555;line-height:1.6;margin-bottom:13px}
/* ── Shared components ── */
.stat-bar{display:grid;grid-template-columns:repeat(4,1fr);background:#0B1029;border-radius:6px;overflow:hidden;margin-bottom:13px}
.stat{padding:12px 14px;border-right:1px solid rgba(255,255,255,.08)}
.stat:last-child{border-right:none}
.stat-value{font-size:17pt;font-weight:700;color:#8D8DFF;margin-bottom:3px}
.stat-label{font-size:7.5pt;color:#aac0e0}
.img-banner{width:100%;border-radius:7px;object-fit:cover;display:block;margin-bottom:14px}
.why-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:13px}
.why-card{background:#f8f8ff;border:1px solid #e4e4f5;border-left:4px solid #8D8DFF;border-radius:4px;padding:12px}
.why-card.green{border-left-color:#1ED69A}
.why-card h4{font-size:9pt;font-weight:700;color:#0B1029;margin-bottom:4px}
.why-card p{font-size:8.5pt;color:#555;line-height:1.5}
.why-card .wi{font-size:16pt;margin-bottom:6px}
.solution-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:13px}
.sol-card{background:#0B1029;border-radius:6px;padding:13px 12px;color:#fff}
.sol-card h4{font-size:8.5pt;font-weight:700;color:#8D8DFF;margin-bottom:7px;letter-spacing:.04em;text-transform:uppercase}
.sol-card ul{list-style:none}
.sol-card ul li{font-size:8pt;color:#c5d3f8;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.06);line-height:1.45}
.sol-card ul li:last-child{border-bottom:none}
.sol-card ul li::before{content:'→ ';color:#1ED69A;font-weight:700}
.hw-row{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:11px}
.hw-card{border:1px solid #e4e4f5;border-radius:6px;padding:12px}
.hw-card h4{font-size:9.5pt;font-weight:700;color:#0B1029;margin-bottom:3px}
.hw-badge{display:inline-block;background:#1ED69A;color:#0B1029;font-size:7.5pt;font-weight:700;padding:2px 8px;border-radius:12px;margin-bottom:8px}
.hw-spec{font-size:7.5pt;color:#666;margin-bottom:2px}
.hw-spec strong{color:#333}
.hw-note{font-size:7.5pt;color:#8D8DFF;font-weight:600;margin-top:6px}
.pricing-header{background:#0B1029;border-radius:6px 6px 0 0;padding:11px 15px;color:#fff}
.pricing-header h3{font-family:'Playfair Display',serif;font-style:italic;font-size:14pt;color:#fff}
.pricing-header p{font-size:8pt;color:#aac0e0;margin-top:3px}
.pricing-body{border:1px solid #e4e4f5;border-top:none;border-radius:0 0 6px 6px;padding:12px 15px;margin-bottom:12px}
.pr{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f8}
.pr:last-child{border-bottom:none}
.pr-label{font-size:8.5pt;color:#333;font-weight:500}
.pr-label small{display:block;font-size:7pt;color:#888;font-weight:400}
.pr-value{font-size:10pt;font-weight:700;color:#0B1029}
.pr-value.hl{color:#8D8DFF}
.pr-value.gn{color:#1ED69A}
.cnp-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:9px;margin-bottom:13px}
.cnp-card{background:#f8f8ff;border:1px solid #e4e4f5;border-radius:6px;padding:10px 9px;text-align:center}
.cnp-card .ci{font-size:18pt;margin-bottom:5px}
.cnp-card h4{font-size:8pt;font-weight:700;color:#0B1029;margin-bottom:3px}
.cnp-card p{font-size:7.5pt;color:#666;line-height:1.4}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:13px}
.step{text-align:center}
.step-num{width:30px;height:30px;background:#8D8DFF;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:700;color:#fff;margin:0 auto 7px}
.step-title{font-size:8.5pt;font-weight:700;color:#0B1029;margin-bottom:3px}
.step-desc{font-size:7.5pt;color:#666;line-height:1.4}
.step-connector{height:2px;background:linear-gradient(90deg,#8D8DFF,#1ED69A);margin:11px 0 8px}
.cta-box{background:#0B1029;border-radius:8px;padding:17px 19px;color:#fff}
.cta-box h3{font-family:'Playfair Display',serif;font-style:italic;font-size:16pt;color:#fff;margin-bottom:7px}
.cta-box p{font-size:8.5pt;color:#aac0e0;line-height:1.6;margin-bottom:11px}
.cta-contacts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.cta-contact{background:rgba(141,141,255,.1);border:1px solid rgba(141,141,255,.2);border-radius:4px;padding:9px 11px}
.cta-contact .cl{font-size:7pt;color:#8D8DFF;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}
.cta-contact .cv{font-size:9pt;color:#fff;font-weight:600}
.divider{height:1px;background:linear-gradient(90deg,#8D8DFF,transparent);margin:13px 0}
.pos-box{text-align:center;background:linear-gradient(135deg,#f8f8ff,#eeeeff);border-radius:8px;padding:12px 8px 8px;margin-bottom:13px;border:1px solid #e4e4f5}
.pos-box img{max-height:148px;max-width:100%;object-fit:contain;display:inline-block}
.pos-box p{font-size:7.5pt;color:#8D8DFF;margin-top:7px;font-weight:600;letter-spacing:.04em}
</style>
</head>
<body>
${trackingScript}

<!-- Sticky bar -->
<div class="sticky-bar no-print">
  <div class="sticky-bar-merchant">Prepared for <strong>${m}</strong></div>
  <div class="sticky-bar-actions">
    <button class="btn-outline" onclick="window.print()" data-track="pdf_download">Download PDF</button>
    <a class="btn-primary" href="https://www.urpay.com.au/enquire" target="_blank" data-track="cta_click">Get Started</a>
  </div>
</div>

<!-- PAGE 1: COVER -->
<div class="page cover" style="padding:0;min-height:267mm">
  <div class="cover-left">
    <div class="cover-logo">UrPay</div>
    <div>
      <div class="cover-eyebrow">${t.coverEyebrow}</div>
      <div class="cover-headline">${t.coverHead(m)}</div>
      <div class="cover-sub">${t.coverSub}</div>
      <div class="cover-pills">${pills}</div>
    </div>
    <div class="cover-footer">
      <span>Prepared for ${m}<br>urpay.com.au · 1800 008 772</span>
      <span>2026 · Confidential<br>UrPay Technologies Pty Ltd</span>
    </div>
  </div>
  <div class="cover-right">
    <img src="${t.heroImg}" alt="" />
    <div class="cover-right-fade"></div>
  </div>
</div>

<!-- PAGE 2: WHY URPAY -->
<div class="page">
  <div class="page-header">
    <div class="page-header-brand">UrPay — ${t.title}</div>
    <div class="page-header-section">Why UrPay</div>
  </div>
  <div class="section-eyebrow">The UrPay Difference</div>
  <div class="section-title">${t.whyTitle}</div>
  <div class="section-sub">${t.whySub}</div>
  <div class="stat-bar">
    <div class="stat"><div class="stat-value">1,000+</div><div class="stat-label">Active payment touchpoints</div></div>
    <div class="stat"><div class="stat-value">T+1</div><div class="stat-label">Next-day settlement</div></div>
    <div class="stat"><div class="stat-value">99.9%</div><div class="stat-label">Platform uptime SLA</div></div>
    <div class="stat"><div class="stat-value">24/7</div><div class="stat-label">Local support team</div></div>
  </div>
  <img class="img-banner" src="${t.lifestyleImg}" style="height:95px;object-position:center 30%" alt="" />
  <div class="why-grid">
    <div class="why-card"><div class="wi">⚡</div><h4>One Platform. Everything.</h4><p>Card present, card not present, NPP, Pay by Link, virtual terminal — all from a single merchant portal. No juggling multiple providers.</p></div>
    <div class="why-card green"><div class="wi">🔒</div><h4>Enterprise Security, SMB Simplicity</h4><p>PCI-DSS compliant, tokenised transactions, real-time fraud monitoring — without the complexity. Protected from day one.</p></div>
    <div class="why-card"><div class="wi">📊</div><h4>Real Intelligence, Not Just Reports</h4><p>Live transaction dashboard, settlement tracking, anomaly alerts. Know exactly what's happening at any hour — not just end of day.</p></div>
    <div class="why-card"><div class="wi">🤝</div><h4>A Partner, Not Just a Provider</h4><p>A dedicated account manager, AU-based support, and a team that understands hospitality and retail. When things need fixing, we're already on it.</p></div>
  </div>
  <div class="divider"></div>
  <p style="font-size:8.5pt;color:#555;line-height:1.6">UrPay is an Australian-built payments platform operating under full acquirer licence coverage. We power card-present and card-not-present payments for hospitality, retail, and professional services merchants across Australia.</p>
  <div class="page-footer"><span>UrPay Technologies Pty Ltd · urpay.com.au · 1800 008 772</span><span>Prepared for ${m}</span></div>
</div>

<!-- PAGE 3: THE SOLUTION -->
<div class="page">
  <div class="page-header">
    <div class="page-header-brand">UrPay — ${t.title}</div>
    <div class="page-header-section">The Solution</div>
  </div>
  <div class="section-eyebrow">What You Get</div>
  <div class="section-title">Every way your customers<br>want to <span>pay</span></div>
  <div class="section-sub">${t.solSub}</div>
  <img class="img-banner" src="${t.solutionImg}" style="height:80px;object-position:center 35%" alt="" />
  <div class="solution-grid">
    <div class="sol-card"><h4>In-Store / POS</h4><ul><li>Portable Android terminals</li><li>Countertop EFTPOS</li><li>Tap, chip, swipe &amp; PIN</li><li>Split bills &amp; tableside</li><li>600+ POS integrations</li><li>Surcharge or absorb model</li><li>Apple Pay &amp; Google Pay</li></ul></div>
    <div class="sol-card"><h4>Online / CNP</h4><ul><li>Secure payment gateway</li><li>Pay by Link (SMS/email)</li><li>Virtual terminal (phone orders)</li><li>3D Secure fraud protection</li><li>Recurring billing support</li><li>Multi-gateway redundancy</li><li>Real-time CNP reporting</li></ul></div>
    <div class="sol-card"><h4>NPP &amp; Modern Rails</h4><ul><li>NPP-native (AU) PayID</li><li>PayTo authorisation</li><li>Instant settlement available</li><li>BECS direct entry</li><li>Pay by Link via NPP</li><li>Real-time payment status</li><li>Full reconciliation support</li></ul></div>
  </div>
  <div style="background:#F1ECFC;border-radius:6px;padding:12px 15px">
    <div style="font-size:7.5pt;font-weight:700;color:#8D8DFF;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px">POS Integration — Hospitality &amp; Retail</div>
    <div style="font-size:8.5pt;color:#333;line-height:1.6">UrPay connects directly to Lightspeed, Deputy, MYOB, Xero, and 600+ other POS systems. Your existing system stays — UrPay plugs in. No rip-and-replace. Same-day setup.</div>
  </div>
  <div class="page-footer"><span>UrPay Technologies Pty Ltd · urpay.com.au · 1800 008 772</span><span>Prepared for ${m}</span></div>
</div>

<!-- PAGE 4: FREE HARDWARE -->
<div class="page">
  <div class="page-header">
    <div class="page-header-brand">UrPay — ${t.title}</div>
    <div class="page-header-section">Free Hardware</div>
  </div>
  <div class="section-eyebrow">Zero Upfront Cost</div>
  <div class="section-title">Premium terminals.<br><span>Completely free.</span></div>
  <div class="section-sub">No terminal purchase cost. No monthly rental fee. UrPay provides your hardware — you just process payments.</div>
  <div class="pos-box"><img src="${IMG}/pos-terminals.jpg" alt="UrPay Terminals" /><p>UrPay Android Payment Terminals — Portable &amp; Countertop · Both Included Free</p></div>
  <div class="hw-row">
    <div class="hw-card"><h4>UrPay Portable Terminal</h4><div class="hw-badge">FREE — Included</div><div class="hw-spec"><strong>Form:</strong> Portable Android — tableside &amp; counter</div><div class="hw-spec"><strong>Screen:</strong> 5" colour touchscreen</div><div class="hw-spec"><strong>Connectivity:</strong> 4G + WiFi + Bluetooth</div><div class="hw-spec"><strong>Payments:</strong> Tap, chip, swipe, PIN, Apple Pay, Google Pay</div><div class="hw-spec"><strong>Battery:</strong> Full-shift life — 8+ hours</div><div class="hw-note">✓ Ideal for restaurants, cafes, bars, pop-up retail</div></div>
    <div class="hw-card"><h4>UrPay Countertop Terminal</h4><div class="hw-badge">FREE — Included</div><div class="hw-spec"><strong>Form:</strong> Fixed countertop — high-volume checkout</div><div class="hw-spec"><strong>Screen:</strong> Merchant + customer-facing display</div><div class="hw-spec"><strong>Connectivity:</strong> Ethernet + WiFi</div><div class="hw-spec"><strong>Payments:</strong> Tap, chip, swipe, PIN, contactless</div><div class="hw-spec"><strong>Integration:</strong> Direct POS system integration</div><div class="hw-note">✓ Ideal for retail counters, hotel reception, QSR</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
    <div style="background:#e6faf3;border:1px solid #b8ead6;border-radius:4px;padding:11px"><div style="font-size:8pt;font-weight:700;color:#1a6632;margin-bottom:4px">✓ No Purchase Cost</div><div style="font-size:8pt;color:#444">Hardware at no cost with your UrPay account. No upfront investment required.</div></div>
    <div style="background:#e6faf3;border:1px solid #b8ead6;border-radius:4px;padding:11px"><div style="font-size:8pt;font-weight:700;color:#1a6632;margin-bottom:4px">✓ No Monthly Rental</div><div style="font-size:8pt;color:#444">Unlike competitors charging $29–$49/month per terminal, UrPay hardware is genuinely free.</div></div>
    <div style="background:#e6faf3;border:1px solid #b8ead6;border-radius:4px;padding:11px"><div style="font-size:8pt;font-weight:700;color:#1a6632;margin-bottom:4px">✓ Same-Day Replacement</div><div style="font-size:8pt;color:#444">Faulty terminal? We replace it fast. Your business can't afford downtime.</div></div>
  </div>
  <div class="page-footer"><span>UrPay Technologies Pty Ltd · urpay.com.au · 1800 008 772</span><span>Prepared for ${m}</span></div>
</div>

<!-- PAGE 5: PRICING -->
<div class="page">
  <div class="page-header">
    <div class="page-header-brand">UrPay — ${t.title}</div>
    <div class="page-header-section">Rates &amp; Pricing</div>
  </div>
  <div class="section-eyebrow">Transparent Pricing</div>
  <div class="section-title">Simple rates.<br>No <span>surprises</span>.</div>
  <div class="section-sub">One clear rate covers all major card types — Visa, Mastercard, and eftpos. No monthly fees, no terminal rental, no hidden charges.</div>
  <div style="position:relative;overflow:hidden;border-radius:7px;height:68px;margin-bottom:13px;border:1px solid #e4e4f5">
    <img src="${IMG}/portal-dashboard.jpg" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block" alt="" />
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,16,41,.82),rgba(11,16,41,.4),transparent);display:flex;align-items:center;padding-left:16px">
      <div style="font-family:'DM Sans',sans-serif;font-size:7.5pt;font-weight:700;color:#8D8DFF;text-transform:uppercase;letter-spacing:.1em">Live Merchant Portal &nbsp;·&nbsp; Real-Time Transactions &amp; Settlements</div>
    </div>
  </div>
  <div class="pricing-header"><h3>Your Pricing — ${m}</h3><p>Includes all card types · All terminals · Card-present &amp; card-not-present</p></div>
  <div class="pricing-body">
    <div class="pr"><div class="pr-label">In-Store — Tap, Chip &amp; PIN<small>Visa, Mastercard, eftpos — all card types included</small></div><div class="pr-value hl">${rate}</div></div>
    <div class="pr"><div class="pr-label">Online / Card Not Present<small>Gateway, Pay by Link, virtual terminal</small></div><div class="pr-value hl">From 1.7%</div></div>
    <div class="pr"><div class="pr-label">NPP / PayID Payments<small>Real-time bank transfers via NPP rails (AU)</small></div><div class="pr-value hl">From 0.6%</div></div>
    <div class="pr"><div class="pr-label">Monthly Account Fee<small>Includes portal access, reporting, support</small></div><div class="pr-value gn">$0</div></div>
    <div class="pr"><div class="pr-label">Terminal Hardware<small>Portable + countertop — included with your account</small></div><div class="pr-value gn">FREE</div></div>
    <div class="pr"><div class="pr-label">Settlement<small>Next business day to your nominated account</small></div><div class="pr-value gn">T+1</div></div>
    <div class="pr"><div class="pr-label">Contract Term<small>Month to month — no lock-in</small></div><div class="pr-value gn">None</div></div>
    <p style="font-size:7pt;color:#888;margin-top:7px;line-height:1.5">* Rates shown are tailored to ${m}. Higher volume = lower rate. Contact your UrPay account manager for the final confirmed rate.</p>
  </div>
  <div style="background:#F1ECFC;border-radius:6px;padding:12px 15px">
    <div style="font-size:7.5pt;font-weight:700;color:#8D8DFF;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px">Surcharge Option Available</div>
    <div style="font-size:8.5pt;color:#333;line-height:1.6">UrPay supports merchant surcharging in line with RBA regulations. With the RBA's surcharge ban effective <strong>October 2026</strong>, our team will work with you on the best pricing model ahead of that change.</div>
  </div>
  <div class="page-footer"><span>UrPay Technologies Pty Ltd · urpay.com.au · 1800 008 772</span><span>Prepared for ${m}</span></div>
</div>

<!-- PAGE 6: CNP -->
<div class="page">
  <div class="page-header">
    <div class="page-header-brand">UrPay — ${t.title}</div>
    <div class="page-header-section">Online &amp; CNP</div>
  </div>
  <div class="section-eyebrow">Card Not Present</div>
  <div class="section-title">Take payments anywhere<br>your customers <span>are</span></div>
  <div class="section-sub">In-store is only part of the picture. UrPay gives you the tools to accept payments over the phone, via a link, or online — same account, same settlement.</div>
  <img class="img-banner" src="${t.cnpImg}" style="height:85px;object-position:center 35%" alt="" />
  <div class="cnp-grid">
    <div class="cnp-card"><div class="ci">🔗</div><h4>Pay by Link</h4><p>Send via SMS, email or WhatsApp. Customer taps, pays, done. No app. No login. No friction.</p></div>
    <div class="cnp-card"><div class="ci">💻</div><h4>Virtual Terminal</h4><p>Take card payments over the phone from any browser. Key in card details securely.</p></div>
    <div class="cnp-card"><div class="ci">🌐</div><h4>Online Gateway</h4><p>Embed UrPay's secure checkout into your website or booking system. 3D Secure included.</p></div>
    <div class="cnp-card"><div class="ci">⚡</div><h4>NPP PayID</h4><p>Real-time bank transfers via PayID. Lower cost, instant settlement, no chargebacks.</p></div>
  </div>
  <div style="background:#0B1029;border-radius:6px;padding:13px 15px;color:#fff;margin-bottom:12px">
    <div style="font-size:7.5pt;font-weight:700;color:#8D8DFF;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px">Real-World Use Cases</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div><div style="font-size:8.5pt;font-weight:600;color:#1ED69A;margin-bottom:4px">Restaurant / Café / Bar</div><div style="font-size:8pt;color:#c5d3f8;line-height:1.55">Tableside terminal for walk-ins. Phone bookings paid via Pay by Link before arrival. Functions invoiced and settled online.</div></div>
      <div><div style="font-size:8.5pt;font-weight:600;color:#1ED69A;margin-bottom:4px">Retail / Boutique / Markets</div><div style="font-size:8pt;color:#c5d3f8;line-height:1.55">Counter terminal for foot traffic. Virtual terminal for phone orders. Layby via Pay by Link. Online store via UrPay gateway.</div></div>
    </div>
  </div>
  <div style="border:1px solid #e4e4f5;border-left:4px solid #1ED69A;border-radius:4px;padding:11px 13px">
    <div style="font-size:8pt;font-weight:700;color:#1a6632;margin-bottom:4px">Multi-Gateway Redundancy</div>
    <div style="font-size:8.5pt;color:#555;line-height:1.55">UrPay operates across multiple payment gateways simultaneously. If one experiences an outage, transactions automatically route through an alternative — keeping ${m} running when it matters most.</div>
  </div>
  <div class="page-footer"><span>UrPay Technologies Pty Ltd · urpay.com.au · 1800 008 772</span><span>Prepared for ${m}</span></div>
</div>

<!-- PAGE 7: ONBOARDING + CTA -->
<div class="page">
  <div class="page-header">
    <div class="page-header-brand">UrPay — ${t.title}</div>
    <div class="page-header-section">Getting Started</div>
  </div>
  <div class="section-eyebrow">Onboarding</div>
  <div class="section-title">Live in <span>48 hours</span>.<br>We handle everything.</div>
  <div class="section-sub">From application to first transaction in as little as 48 hours. Our onboarding team manages setup end-to-end — you just tell us when you're ready.</div>
  <div class="step-connector"></div>
  <div class="steps">
    <div class="step"><div class="step-num">1</div><div class="step-title">Application</div><div class="step-desc">5-minute online application. ABN, bank details, basic business info.</div></div>
    <div class="step"><div class="step-num">2</div><div class="step-title">Approval</div><div class="step-desc">Same-day decision. Our team reviews and confirms within hours.</div></div>
    <div class="step"><div class="step-num">3</div><div class="step-title">Hardware Shipped</div><div class="step-desc">Terminals configured and dispatched. Express delivery to your address.</div></div>
    <div class="step"><div class="step-num">4</div><div class="step-title">You're Live</div><div class="step-desc">Plug in, tap to test, start processing. Account manager on call.</div></div>
  </div>
  <div class="step-connector"></div>
  <div style="position:relative;overflow:hidden;border-radius:7px;margin-bottom:14px">
    <img src="${IMG}/merchants.jpg" style="width:100%;height:82px;object-fit:cover;object-position:center 30%;display:block" alt="" />
    <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,rgba(11,16,41,.7),transparent);padding:8px 14px;font-size:7.5pt;font-weight:600;color:#c5d3f8;letter-spacing:.04em">Your business. Your way. Australian-built payments infrastructure.</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:15px">
    <div style="border:1px solid #e4e4f5;border-radius:4px;padding:11px"><div style="font-size:8pt;font-weight:700;color:#0B1029;margin-bottom:4px">Portal Access</div><div style="font-size:8pt;color:#555;line-height:1.45">Live transactions, settlement reports, dispute management — all in one place.</div></div>
    <div style="border:1px solid #e4e4f5;border-radius:4px;padding:11px"><div style="font-size:8pt;font-weight:700;color:#0B1029;margin-bottom:4px">Dedicated Support</div><div style="font-size:8pt;color:#555;line-height:1.45">Phone, email, chat. AU-based team. Your account manager knows your business.</div></div>
    <div style="border:1px solid #e4e4f5;border-radius:4px;padding:11px"><div style="font-size:8pt;font-weight:700;color:#0B1029;margin-bottom:4px">No Lock-In</div><div style="font-size:8pt;color:#555;line-height:1.45">Month-to-month. No termination fees. We earn your business every month.</div></div>
  </div>
  <div class="cta-box">
    <h3>Ready to get started?</h3>
    <p>Speak to your UrPay account manager today. We'll confirm your rate and have you live within 48 hours. No obligation — just a conversation.</p>
    <div class="cta-contacts">
      <div class="cta-contact"><div class="cl">Phone</div><div class="cv">1800 008 772</div></div>
      <div class="cta-contact"><div class="cl">Website</div><div class="cv">urpay.com.au</div></div>
      <div class="cta-contact"><div class="cl">Apply Now</div><div class="cv"><a href="https://www.urpay.com.au/enquire" data-track="cta_click" style="color:#8D8DFF;text-decoration:none;font-weight:700">urpay.com.au/enquire →</a></div></div>
    </div>
  </div>
  <div class="page-footer"><span>UrPay Technologies Pty Ltd · urpay.com.au · 1800 008 772</span><span>Confidential — Prepared for ${m} · 2026</span></div>
</div>

</body>
</html>`;
}
