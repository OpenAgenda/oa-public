// Build the post-signin redirect URL the Next form sends with the BA
// `/api/auth/sign-in/email` request (or follows after BA returns success).
// Mirrors `packages/cibul-node/auth/lib/computeRedirect.js` so the UX stays
// identical now that direct-routing replaces the legacy `/signin` wrapper.
//
// - When `?redirect=…` (base64-encoded path) is present and points to a safe
//   same-origin path, we honour it.
// - Otherwise we fall back to `/{agendaSlug}/contribute` (when an agenda is
//   in scope) or `/home`.
//
// FB-unlink redirect (`/settings/unlinkFacebook`) is enforced server-side by
// the BA `after` hook on `/callback/:id` (see packages/auth/src/index.js),
// so we don't replicate it here.

interface ComputePostSignInRedirectOptions {
  redirectParam?: string | null;
  agendaSlug?: string | null;
}

function isSafeSameOriginPath(value: string): boolean {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (value[0] !== '/') return false;
  if (value.startsWith('//') || value.startsWith('/\\')) return false;
  if (/[\r\n\t]/.test(value)) return false;
  if (/^\/+[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return false;
  return true;
}

export function decodeBase64Redirect(value: string): string | null {
  try {
    const decoded =
      typeof atob === 'function'
        ? atob(value)
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (globalThis as any).Buffer?.from(value, 'base64').toString('utf-8');
    if (typeof decoded !== 'string') return null;
    return isSafeSameOriginPath(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export default function computePostSignInRedirect({
  redirectParam,
  agendaSlug,
}: ComputePostSignInRedirectOptions): string {
  if (redirectParam) {
    const decoded = decodeBase64Redirect(redirectParam);
    if (decoded) return decoded;
  }
  if (agendaSlug) return `/${agendaSlug}/contribute`;
  return '/home';
}
