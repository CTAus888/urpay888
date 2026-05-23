/* UrPay — Project 888 — Main JS v2 */

// ── Nav: glass on scroll
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 48);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Scroll reveal (Intersection Observer)
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
  revealEls.forEach(el => io.observe(el));
}

// ── Animated counter
function counter(el, end, duration = 1800, suffix = '') {
  const start = performance.now();
  const isDecimal = String(end).includes('.');
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    const val = isDecimal ? (ease * end).toFixed(1) : Math.round(ease * end).toLocaleString();
    el.textContent = val + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const countEls = document.querySelectorAll('[data-count]');
if (countEls.length) {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const end = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        counter(el, end, 1800, suffix);
        cio.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  countEls.forEach(el => cio.observe(el));
}

// ── Mobile nav
const burger = document.getElementById('hamburger');
if (burger) {
  let open = false;
  burger.addEventListener('click', () => {
    open = !open;
    const links = document.querySelector('.nav-links');
    const cta   = document.querySelector('.nav-cta');
    if (links) {
      Object.assign(links.style, open ? {
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 'var(--nav-h)',
        left: '0', right: '0', bottom: '0',
        background: 'rgba(10,7,26,0.98)',
        backdropFilter: 'blur(24px)',
        padding: '32px 28px', gap: '28px',
        zIndex: '150', alignItems: 'flex-start',
        fontSize: '1.125rem',
      } : { display: '', position: '', background: '',
            backdropFilter: '', padding: '', gap: '',
            flexDirection: '' });
    }
    burger.classList.toggle('open', open);
  });
  // close on link click
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => { open = false; burger.click(); burger.click(); })
  );
}

// ── Scheme strip pause on hover (already in CSS, backup)
const strip = document.querySelector('.strip-track');
if (strip) {
  strip.addEventListener('mouseenter', () => strip.style.animationPlayState = 'paused');
  strip.addEventListener('mouseleave', () => strip.style.animationPlayState = 'running');
}

// ══════════════════════════════════════════
// UrPay Chat Widget
// ══════════════════════════════════════════

(function () {

  // Detect root vs /pages/ subdirectory for relative paths
  const inPages = window.location.pathname.includes('/pages/');
  const base    = inPages ? '../' : '';
  const contactHref = base + 'pages/contact.html';

  // ── Build DOM ──────────────────────────
  const trigger = document.createElement('button');
  trigger.className = 'chat-trigger';
  trigger.setAttribute('aria-label', 'Open UrPay Assistant');
  trigger.innerHTML = `
    <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
    <span class="chat-badge">1</span>
  `;

  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'UrPay Assistant');
  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </div>
      <div class="chat-header-info">
        <div class="chat-header-name">UrPay Assistant</div>
        <div class="chat-header-status"><span class="chat-status-dot"></span> Online — typically replies instantly</div>
      </div>
      <img src="${base}images/urpay-logo-white.png" alt="UrPay" class="chat-header-logo" onerror="this.style.display='none'">
    </div>
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-quick-replies" id="quickReplies"></div>
    <div class="chat-input-area">
      <textarea class="chat-input" id="chatInput" placeholder="Ask me anything about UrPay…" rows="1" maxlength="500"></textarea>
      <button class="chat-send" id="chatSend" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </div>
    <div class="chat-powered">Powered by <a href="#" tabindex="-1">UrPay AI</a> · <a href="${contactHref}" tabindex="-1">Talk to a human</a></div>
  `;

  document.body.appendChild(trigger);
  document.body.appendChild(panel);

  // ── State ──────────────────────────────
  const history = [];  // { role, content }
  let isOpen = false;
  let isTyping = false;
  const QUICK_REPLIES_DEFAULT = [
    'How does UrPay work?',
    'What terminals do you support?',
    'Tell me about NPP / Pay by Link',
    'Partner program',
  ];

  // ── Helpers ────────────────────────────
  const messagesEl   = document.getElementById('chatMessages');
  const quickRepliesEl = document.getElementById('quickReplies');
  const inputEl      = document.getElementById('chatInput');
  const sendBtn      = document.getElementById('chatSend');

  function now() {
    return new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  }

  function addMessage(role, text, animate = true) {
    const wrap = document.createElement('div');
    wrap.className = `chat-msg ${role}`;
    wrap.innerHTML = `
      ${role === 'assistant' ? `<div class="chat-msg-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>` : ''}
      <div>
        <div class="chat-msg-bubble">${text}</div>
        <div class="chat-msg-time">${now()}</div>
      </div>
    `;
    if (!animate) wrap.style.animation = 'none';
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-msg assistant chat-typing-wrap';
    el.innerHTML = `
      <div class="chat-msg-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
      <div class="chat-typing-dots">
        <div class="chat-typing-dot"></div>
        <div class="chat-typing-dot"></div>
        <div class="chat-typing-dot"></div>
      </div>
    `;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function removeTyping() {
    const el = messagesEl.querySelector('.chat-typing-wrap');
    if (el) el.remove();
  }

  function setQuickReplies(replies) {
    quickRepliesEl.innerHTML = '';
    replies.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'chat-qr';
      btn.textContent = r;
      btn.addEventListener('click', () => { sendMessage(r); setQuickReplies([]); });
      quickRepliesEl.appendChild(btn);
    });
  }

  // ── API call ───────────────────────────
  async function callAgent(messages) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.content || data.message || 'I couldn\'t process that — please try again.';
    } catch {
      // Fallback while API is being set up
      return `I'm still being set up — for immediate help call <strong><a href="tel:1800008772" style="color:var(--p)">1800 008 772</a></strong> or <a href="${contactHref}" style="color:var(--p)">send us a message</a>.`;
    }
  }

  // ── Send message ───────────────────────
  async function sendMessage(text) {
    text = text.trim();
    if (!text || isTyping) return;
    isTyping = true;
    sendBtn.disabled = true;
    inputEl.value = '';
    inputEl.style.height = '';
    setQuickReplies([]);

    addMessage('user', text);
    history.push({ role: 'user', content: text });

    const typingEl = showTyping();

    // Simulate realistic thinking delay (600–1400ms)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const reply = await callAgent(history);
    removeTyping();
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });

    isTyping = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }

  // ── Toggle open/close ──────────────────
  function open() {
    isOpen = true;
    panel.classList.add('open');
    trigger.classList.add('open');
    trigger.setAttribute('aria-label', 'Close UrPay Assistant');
    // Remove badge
    const badge = trigger.querySelector('.chat-badge');
    if (badge) badge.remove();
    inputEl.focus();
  }

  function close() {
    isOpen = false;
    panel.classList.remove('open');
    trigger.classList.remove('open');
    trigger.setAttribute('aria-label', 'Open UrPay Assistant');
  }

  trigger.addEventListener('click', () => isOpen ? close() : open());

  // Close on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });

  // ── Input auto-resize + send on Enter ──
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  });
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputEl.value); }
  });
  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

  // ── Welcome message on load ─────────────
  setTimeout(() => {
    addMessage('assistant', 'Hi! I\'m the UrPay assistant. I can answer questions about our payment platform, terminals, integrations, and partner program. What can I help you with?', false);
    setQuickReplies(QUICK_REPLIES_DEFAULT);
  }, 500);

})();
