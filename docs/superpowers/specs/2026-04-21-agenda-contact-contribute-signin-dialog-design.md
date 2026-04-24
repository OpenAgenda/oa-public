# Agenda "Contact" and "Add an event" buttons — signin dialog flow

**Date:** 2026-04-21
**Scope:** `packages/next` only

## Background

On the public agenda page (`AgendaShow`), two header buttons currently link to pages that require authentication:

- **Add an event** → `/{slug}/contribute`
- **Contact** → `/{slug}/contact` (unless the agenda has `settings.inbox.mailto.enabled`, in which case the button opens `mailto:` and auth is irrelevant)

For signed-out users, clicking either of these takes them to a full-page signin. We want the click to open the existing `AuthDialog` (already used in `ProfileMenu`) instead, and on successful signin redirect the user to the destination they originally wanted.

## Goals

1. Signed-out users clicking "Add an event" or "Contact" on an agenda page get the `AuthDialog`, not a page navigation to signin.
2. On successful signin from the dialog, the user lands on the original target URL (`/{slug}/contribute` or `/{slug}/contact`).
3. Signed-in users keep the current behavior (direct link).
4. When "Contact" resolves to a `mailto:` URL, auth is bypassed (no dialog).
5. No regressions on the existing `AuthDialog` usages in `ProfileMenu`.

## Non-goals

- Other signed-in-only entrypoints (export, aggregate, EventShow contribute, etc.).
- Changes to the backend `/signin` endpoint or the Google OAuth flow.
- Locale / translation changes (message ids stay the same so existing translations apply).

## Design

### 1. `AuthDialog` / `Signin` — new `redirectOnSuccess` prop

Add an optional `redirectOnSuccess?: string` to both `AuthDialog` and `Signin`. `AuthDialog` passes it through to `Signin`.

In `Signin.handleSubmit`, when the backend responds:

- `data.success === true`:
  - If `redirectOnSuccess` is set → `window.location.href = redirectOnSuccess`.
  - Else fall back to existing logic: `reloadOnSuccess` or missing `data.redirect` → reload; otherwise navigate to `data.redirect`.
- `data.success === false`:
  - Unchanged. `data.redirect` still wins (activation required, Facebook migration, etc.). This is important — callers shouldn't override a server-mandated detour.

`redirectOnSuccess` and `reloadOnSuccess` are mutually exclusive in practice; if a caller passes both, `redirectOnSuccess` takes precedence (it's the more specific intent).

### 2. New `ContributeButton` component

New file: `packages/next/src/views/AgendaShow/components/ContributeButton.tsx`.

Responsibilities:

- Accept `agenda: { slug: string; uid: string }` as its only prop.
- Read session from cookies (`useCookies` + `getSession`).
- Compute `contributeHref = hrefWithLang('/{slug}/contribute', sessionUser ? null : intl.locale)`.
- Owns the `addEvent` message (moved from `AgendaHeader` — keep the existing message id `next.views.AgendaShow.AgendaHeader.addEvent` so translations continue to apply without any locale-file changes).
- Render:
  - Signed in → `<Button asChild><Link href={contributeHref}>…</Link></Button>`.
  - Signed out → `<AuthDialog agenda={{slug, uid}} redirectOnSuccess={contributeHref}><Button>…</Button></AuthDialog>`.

### 3. New `ContactButton` component

New file: `packages/next/src/views/AgendaShow/components/ContactButton.tsx`.

Responsibilities:

- Accept `agenda` as prop; uses `agenda.slug`, `agenda.uid`, and `agenda.settings.inbox?.mailto`.
- Read session from cookies.
- Compute `mailtoUrl` (existing `getMailtoUrl` helper — move it into this file since it's the only remaining caller) and `contactHref = hrefWithLang('/{slug}/contact', sessionUser ? null : intl.locale)`.
- Owns the `contact` message (moved from `AgendaHeader`, id preserved as `next.views.AgendaShow.AgendaHeader.contact`).
- Keep the existing `variant="outline"` styling / hover state.
- Render:
  - Signed in **or** `mailtoUrl` is set → plain button linking to `mailtoUrl || contactHref`.
  - Otherwise → `<AuthDialog agenda={{slug, uid}} redirectOnSuccess={contactHref}><Button>…</Button></AuthDialog>`.

### 4. `AgendaHeader` wiring

In `AgendaHeader.tsx`:

- Delete the inline contribute / contact buttons and the session/mailto wiring that only fed them (`useCookies`, `getSession`, `contactHref`, `contributeHref`, `mailtoUrl`, `getMailtoUrl`, the `contact` and `addEvent` message definitions).
- Import and render `<ContactButton agenda={agenda} />` and `<ContributeButton agenda={agenda} />` where the inline buttons used to be.
- Export/Aggregate buttons and everything else stay as-is.

## File changes

- NEW `packages/next/src/views/AgendaShow/components/ContributeButton.tsx`
- NEW `packages/next/src/views/AgendaShow/components/ContactButton.tsx`
- MOD `packages/next/src/components/auth/AuthDialog.tsx` — add `redirectOnSuccess` prop, plumb to `Signin`.
- MOD `packages/next/src/components/auth/Signin.tsx` — honor `redirectOnSuccess` in the `data.success` branch.
- MOD `packages/next/src/views/AgendaShow/components/AgendaHeader.tsx` — delete inline buttons + related logic; import the two new components.

No locale file changes. Message ids are preserved when messages move between files, so existing translations continue to apply; `yarn extract-messages` just relocates the definitions.

## Testing

Manual in `packages/next`:

- Signed-out on `/{slug}` → click "Add an event" → `AuthDialog` opens → enter valid credentials → redirected to `/{slug}/contribute`.
- Same flow with wrong password → error stays inline in the dialog; dialog doesn't close.
- Same flow with an inactive account → backend returns `data.redirect` to activation complete page; user goes there (not contribute).
- Google signin button inside the dialog → OAuth callback lands on `/{slug}/contribute` via the backend's agenda-scoped default.
- Signed-in user → clicking "Add an event" navigates directly; no dialog.
- Signed-out on an agenda without `mailto` → "Contact" opens the dialog; signin redirects to `/{slug}/contact`.
- Signed-out on an agenda with `settings.inbox.mailto.enabled` → "Contact" opens the user's mail client; no dialog.
- Existing `AuthDialog` usage in `ProfileMenu` (no `redirectOnSuccess`, `reloadOnSuccess`) unchanged: signin reloads the current page.

## Rollout

Single PR in `packages/next`. No DB, API, or locale migrations. No feature flag needed — the change is a UX improvement on the same auth surface.
