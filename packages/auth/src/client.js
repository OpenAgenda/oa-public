import { createAuthClient } from 'better-auth/client';

export { createAuthClient };

// Default client. Browser callers hit /api/auth/* on the same origin, so the
// baseURL is left implicit; SSR / node callers (no `window`) must build their
// own instance via `createAuthClient({ baseURL })`.
export const authClient = createAuthClient();

export default authClient;
