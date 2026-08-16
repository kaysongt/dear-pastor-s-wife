import './core.js';

type RegisterEventCore = {
  handleRegistrationRequest: (
    request: Request,
    env: Record<string, string>,
    fetchImpl?: typeof fetch,
  ) => Promise<Response>;
};

const core = (globalThis as typeof globalThis & { DPWRegisterEventCore: RegisterEventCore })
  .DPWRegisterEventCore;

Deno.serve((request: Request) => core.handleRegistrationRequest(request, {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL') || '',
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  TURNSTILE_SECRET_KEY: Deno.env.get('TURNSTILE_SECRET_KEY') || '',
  RATE_LIMIT_SECRET: Deno.env.get('RATE_LIMIT_SECRET') || '',
}));
