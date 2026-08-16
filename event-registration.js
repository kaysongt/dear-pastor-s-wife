(function attachEventRegistration(root) {
  'use strict';

  const ALLOWED_EVENTS = Object.freeze({
    'dpw-tea-party-chicago': 'DPW Tea Party',
    'dpw-kingsword-nigeria': 'DPW at KingsWord',
  });

  const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE = /^[0-9+().\-\s]+$/;
  const CONTROLS = /[\u0000-\u001f\u007f]/;

  function text(value, field, max, required) {
    const normalized = String(value == null ? '' : value).trim();
    if (required && !normalized) throw new Error(`${field} is required`);
    if (normalized.length > max) throw new Error(`${field} is too long`);
    if (CONTROLS.test(normalized)) throw new Error(`${field} contains unsupported characters`);
    return normalized;
  }

  async function readStreamWithLimit(stream, maxBytes, timeoutMs, onTimeout) {
    if (!stream || typeof stream.getReader !== 'function') throw new Error('Missing response body');
    const reader = stream.getReader();
    const chunks = [];
    let total = 0;
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        try { onTimeout?.(); } catch {}
        void reader.cancel().catch(() => {});
        reject(new Error('Response body timeout'));
      }, Math.max(1, timeoutMs));
    });
    const read = (async () => {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        if (!(part.value instanceof Uint8Array)) throw new Error('Invalid response body');
        total += part.value.byteLength;
        if (total > maxBytes) {
          await reader.cancel();
          throw new Error('Response body too large');
        }
        chunks.push(part.value);
      }
      const bytes = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return bytes;
    })();
    try {
      return await Promise.race([read, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchJsonWithinDeadline(fetchImpl, url, options, timeoutMs, maxBytes) {
    const started = Date.now();
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timer;
    const fetchTimeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller?.abort();
        reject(new Error('Request timeout'));
      }, Math.max(1, timeoutMs));
    });
    let response;
    try {
      response = await Promise.race([
        fetchImpl(url, { ...options, ...(controller ? { signal: controller.signal } : {}) }),
        fetchTimeout,
      ]);
    } finally {
      clearTimeout(timer);
    }
    if (!response || !response.ok) throw new Error('Request failed');
    const remaining = Math.max(1, timeoutMs - (Date.now() - started));
    const bytes = await readStreamWithLimit(response.body, maxBytes, remaining, () => controller?.abort());
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return JSON.parse(raw);
  }

  function buildRegistrationPayload({ eventSlug, submissionId, turnstileToken, data }) {
    const eventTitle = ALLOWED_EVENTS[eventSlug];
    if (!eventTitle) throw new Error('Registration is not available for this event');
    if (!UUID_V4.test(String(submissionId || ''))) throw new Error('Invalid submission identifier');
    if (!data || typeof data !== 'object') throw new Error('Registration details are required');
    if (text(data.website, 'Website', 200, false)) throw new Error('Registration could not be accepted');
    const botProof = text(turnstileToken, 'Verification', 2048, true);

    const email = text(data.email, 'Email', 254, true).toLowerCase();
    if (!EMAIL.test(email)) throw new Error('Enter a valid email address');
    const phone = text(data.phone, 'Phone', 40, true);
    const digitCount = phone.replace(/\D/g, '').length;
    if (!PHONE.test(phone) || digitCount < 7 || digitCount > 20) throw new Error('Enter a valid phone number');
    const consent = data.consent === true || data.consent === 'on' || data.consent === 'yes';
    if (!consent) throw new Error('Consent is required');

    return {
      submission_id: submissionId.toLowerCase(),
      event_slug: eventSlug,
      event_title: eventTitle,
      first_name: text(data.firstName, 'First name', 80, true),
      last_name: text(data.lastName, 'Last name', 80, true),
      email,
      phone,
      address: text(data.address, 'Address', 200, false),
      city: text(data.city, 'City', 100, false),
      country: text(data.country, 'Country', 100, false),
      ministry_role: text(data.role, 'Ministry role', 160, false),
      notes: text(data.notes, 'Notes', 2000, false),
      consent: true,
      website: '',
      turnstile_token: botProof,
    };
  }

  async function submitRegistration({
    supabaseUrl,
    anonKey,
    eventSlug,
    submissionId,
    turnstileToken,
    data,
    fetchImpl = root.fetch,
    timeoutMs = 12000,
  }) {
    const base = String(supabaseUrl || '').replace(/\/$/, '');
    if (!/^https:\/\//i.test(base) || !anonKey || typeof fetchImpl !== 'function') {
      throw new Error('Registration storage is unavailable');
    }
    const payload = buildRegistrationPayload({ eventSlug, submissionId, turnstileToken, data });
    let result;
    try {
      result = await fetchJsonWithinDeadline(fetchImpl, `${base}/functions/v1/register-event`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }, timeoutMs, 4096);
    } catch {
      throw new Error('Registration could not be saved. Please try again.');
    }
    if (!result || !['stored', 'duplicate'].includes(result.status)) {
      throw new Error('Registration could not be saved. Please try again.');
    }
    return { status: result.status, submissionId: payload.submission_id };
  }

  const api = Object.freeze({ ALLOWED_EVENTS, buildRegistrationPayload, submitRegistration });
  root.DPWEventRegistration = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
