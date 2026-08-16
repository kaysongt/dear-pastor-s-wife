(function attachRegisterEventCore(root) {
  'use strict';

  const ALLOWED_ORIGINS = new Set([
    'https://dearpastorswife.org',
    'https://www.dearpastorswife.org',
  ]);
  const ALLOWED_EVENTS = Object.freeze({
    'dpw-tea-party-chicago': 'DPW Tea Party',
    'dpw-kingsword-nigeria': 'DPW at KingsWord',
  });
  const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE = /^[0-9+().\-\s]+$/;
  const CONTROLS = /[\u0000-\u001f\u007f]/;

  function corsHeaders(origin) {
    const headers = {
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
      'Vary': 'Origin',
    };
    if (ALLOWED_ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
    return headers;
  }

  function json(origin, status, body) {
    return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
  }

  function text(value, max, required) {
    const normalized = String(value == null ? '' : value).trim();
    if ((required && !normalized) || normalized.length > max || CONTROLS.test(normalized)) {
      throw new Error('invalid registration');
    }
    return normalized;
  }

  async function readStreamWithLimit(stream, maxBytes, timeoutMs, onTimeout) {
    if (!stream || typeof stream.getReader !== 'function') throw new Error('missing body');
    const reader = stream.getReader();
    const chunks = [];
    let total = 0;
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        try { onTimeout?.(); } catch {}
        void reader.cancel().catch(() => {});
        reject(new Error('body timeout'));
      }, Math.max(1, timeoutMs));
    });
    const read = (async () => {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        if (!(part.value instanceof Uint8Array)) throw new Error('invalid body');
        total += part.value.byteLength;
        if (total > maxBytes) {
          await reader.cancel();
          throw new Error('body too large');
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

  function decodeJson(bytes) {
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return JSON.parse(raw);
  }

  async function fetchJsonWithinDeadline(fetchImpl, url, options, timeoutMs, maxBytes) {
    const started = Date.now();
    const controller = new AbortController();
    let timer;
    const fetchTimeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error('request timeout'));
      }, Math.max(1, timeoutMs));
    });
    let response;
    try {
      response = await Promise.race([
        fetchImpl(url, { ...options, signal: controller.signal }),
        fetchTimeout,
      ]);
    } finally {
      clearTimeout(timer);
    }
    if (!response || !response.ok) throw new Error('backend unavailable');
    const remaining = Math.max(1, timeoutMs - (Date.now() - started));
    const bytes = await readStreamWithLimit(response.body, maxBytes, remaining, () => controller.abort());
    return decodeJson(bytes);
  }

  function validateRegistration(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid registration');
    const eventTitle = ALLOWED_EVENTS[input.event_slug];
    if (!eventTitle || input.event_title !== eventTitle) throw new Error('invalid registration');
    if (!UUID_V4.test(String(input.submission_id || ''))) throw new Error('invalid registration');
    const email = text(input.email, 254, true).toLowerCase();
    if (!EMAIL.test(email) || email !== input.email) throw new Error('invalid registration');
    const phone = text(input.phone, 40, true);
    const digits = phone.replace(/\D/g, '').length;
    if (!PHONE.test(phone) || digits < 7 || digits > 20) throw new Error('invalid registration');
    if (input.consent !== true) throw new Error('invalid registration');

    return {
      submission_id: String(input.submission_id).toLowerCase(),
      event_slug: input.event_slug,
      event_title: eventTitle,
      first_name: text(input.first_name, 80, true),
      last_name: text(input.last_name, 80, true),
      email,
      phone,
      address: text(input.address, 200, false),
      city: text(input.city, 100, false),
      country: text(input.country, 100, false),
      ministry_role: text(input.ministry_role, 160, false),
      notes: text(input.notes, 2000, false),
      consent: true,
    };
  }

  async function hmacHex(secret, value) {
    const encoder = new TextEncoder();
    const key = await root.crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const bytes = new Uint8Array(await root.crypto.subtle.sign('HMAC', key, encoder.encode(value)));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  async function postJson(url, body, serviceRoleKey, fetchImpl, timeoutMs) {
    return fetchJsonWithinDeadline(fetchImpl, url, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }, timeoutMs, 8192);
  }

  async function handleRegistrationRequest(request, env, fetchImpl = root.fetch, limits = {}) {
    const origin = request.headers.get('origin') || '';
    if (!ALLOWED_ORIGINS.has(origin)) return json(origin, 403, { error: 'Request not allowed' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== 'POST') return json(origin, 405, { error: 'Request not allowed' });

    const contentType = request.headers.get('content-type') || '';
    const contentLength = Number(request.headers.get('content-length') || '0');
    if (!contentType.toLowerCase().startsWith('application/json') || contentLength > 20000) {
      return json(origin, 400, { error: 'Invalid registration' });
    }
    if (!env || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY ||
        !env.TURNSTILE_SECRET_KEY || !env.RATE_LIMIT_SECRET || env.RATE_LIMIT_SECRET.length < 32) {
      return json(origin, 503, { error: 'Registration is temporarily unavailable' });
    }

    const bodyTimeoutMs = Number.isFinite(limits.bodyTimeoutMs) ? Math.max(1, Math.min(5000, limits.bodyTimeoutMs)) : 5000;
    const backendTimeoutMs = Number.isFinite(limits.backendTimeoutMs) ? Math.max(1, Math.min(8000, limits.backendTimeoutMs)) : 8000;
    let input;
    try {
      input = decodeJson(await readStreamWithLimit(request.body, 20000, bodyTimeoutMs));
    } catch {
      return json(origin, 400, { error: 'Invalid registration' });
    }

    if (String(input?.website || '').trim()) {
      return json(origin, 200, { status: 'stored' });
    }

    let registration;
    let token;
    try {
      registration = validateRegistration(input);
      token = text(input.turnstile_token, 2048, true);
    } catch {
      return json(origin, 400, { error: 'Invalid registration' });
    }

    const cloudflareIp = (request.headers.get('cf-connecting-ip') || '').trim();
    const forwarded = request.headers.get('x-forwarded-for') || '';
    const clientIp = cloudflareIp || forwarded.split(',').at(-1).trim();
    if (!clientIp || clientIp.length > 64 || CONTROLS.test(clientIp)) {
      return json(origin, 403, { error: 'Request could not be verified' });
    }

    try {
      const form = new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: clientIp,
      });
      const proof = await fetchJsonWithinDeadline(fetchImpl, 'https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      }, backendTimeoutMs, 16384);
      if (!proof.success || proof.action !== 'event_registration' || !ALLOWED_ORIGINS.has(`https://${proof.hostname}`)) {
        return json(origin, 403, { error: 'Verification failed' });
      }

      const clientHash = await hmacHex(env.RATE_LIMIT_SECRET, clientIp);
      const base = String(env.SUPABASE_URL).replace(/\/$/, '');
      const rateAllowed = await postJson(
        `${base}/rest/v1/rpc/claim_event_registration_attempt`,
        { p_client_hash: clientHash }, env.SUPABASE_SERVICE_ROLE_KEY, fetchImpl, backendTimeoutMs
      );
      if (rateAllowed !== true) return json(origin, 429, { error: 'Please wait before trying again' });

      const result = await postJson(
        `${base}/rest/v1/rpc/register_event_registration`,
        { p_registration: registration }, env.SUPABASE_SERVICE_ROLE_KEY, fetchImpl, backendTimeoutMs
      );
      if (!['stored', 'duplicate'].includes(result)) throw new Error('unexpected registration result');
      return json(origin, 200, { status: result });
    } catch {
      return json(origin, 503, { error: 'Registration is temporarily unavailable' });
    }
  }

  const api = Object.freeze({ handleRegistrationRequest, validateRegistration });
  root.DPWRegisterEventCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : self);
