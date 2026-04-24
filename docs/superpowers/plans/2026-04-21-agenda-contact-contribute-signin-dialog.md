# Agenda Contact & Contribute Signin Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the agenda page, signed-out users clicking "Add an event" or "Contact" open the existing `AuthDialog` and, on successful signin, get redirected to their intended destination instead of being bounced through a full-page signin.

**Architecture:** Add a client-side `redirectOnSuccess` prop to `Signin` / `AuthDialog`. Extract two new self-contained components (`ContributeButton`, `ContactButton`) under `views/AgendaShow/components/` that handle the "link vs dialog" branching and pass `redirectOnSuccess` to the dialog. `AgendaHeader` becomes thinner.

**Tech Stack:** `packages/next` (Next.js, React, TypeScript), `@openagenda/uikit`, `react-intl`, `react-cookie`, existing `AuthDialog` infrastructure. Verification via `yarn typecheck`, `yarn lint`, Storybook (`yarn sb`), and the dev server (`yarn dev`). No unit-test runner in this package.

**Reference:** Spec at `docs/superpowers/specs/2026-04-21-agenda-contact-contribute-signin-dialog-design.md`.

---

## File map

- MODIFY `packages/next/src/components/auth/Signin.tsx` — add `redirectOnSuccess` prop, honor it in the success branch.
- MODIFY `packages/next/src/components/auth/AuthDialog.tsx` — add `redirectOnSuccess` prop, pass through to `Signin`.
- MODIFY `packages/next/stories/components/auth/Signin.stories.tsx` — add a story for the new prop.
- CREATE `packages/next/src/views/AgendaShow/components/ContributeButton.tsx` — self-contained button.
- CREATE `packages/next/src/views/AgendaShow/components/ContactButton.tsx` — self-contained button (includes the moved `getMailtoUrl` helper).
- MODIFY `packages/next/src/views/AgendaShow/components/AgendaHeader.tsx` — drop inline buttons, session/mailto wiring, and the `contact`/`addEvent` message definitions; import the two new components.

All work runs in `packages/next`. No backend, locale, or dependency changes.

---

### Task 1: Add `redirectOnSuccess` prop to `Signin`

**Files:**

- Modify: `packages/next/src/components/auth/Signin.tsx`

- [ ] **Step 1: Extend `SigninProps`**

In `packages/next/src/components/auth/Signin.tsx` at lines 83–91, add the new prop to the interface:

```tsx
interface SigninProps {
  defaultLoading?: boolean;
  defaultSuccess?: boolean;
  defaultInvalidCredentials?: boolean;
  defaultLostPassword?: boolean;
  agenda?: { slug: string; uid: string };
  reloadOnSuccess?: boolean;
  redirectOnSuccess?: string;
  onViewChange?: (view: 'signin' | 'lost') => void;
}
```

- [ ] **Step 2: Destructure the prop in the component signature**

Update the `Signin` component signature (lines 93–101) to destructure `redirectOnSuccess`:

```tsx
export default function Signin({
  defaultLoading = false,
  defaultSuccess = false,
  defaultInvalidCredentials = false,
  defaultLostPassword = false,
  agenda,
  reloadOnSuccess = false,
  redirectOnSuccess,
  onViewChange,
}: SigninProps) {
```

- [ ] **Step 3: Honor `redirectOnSuccess` in the success branch**

In `handleSubmit` (lines 156–166), replace the current success block:

```tsx
if (data.success) {
  setSuccess(true);
  setTimeout(() => {
    if (reloadOnSuccess || !data.redirect) {
      window.location.reload();
    } else {
      window.location.href = data.redirect;
    }
  }, 1000);
  return;
}
```

with:

```tsx
if (data.success) {
  setSuccess(true);
  setTimeout(() => {
    if (redirectOnSuccess) {
      window.location.href = redirectOnSuccess;
    } else if (reloadOnSuccess || !data.redirect) {
      window.location.reload();
    } else {
      window.location.href = data.redirect;
    }
  }, 1000);
  return;
}
```

The `data.success === false` branch (lines 168–171) is unchanged on purpose: a server-mandated detour (activation required, Facebook migration) must still win over the caller's hint.

- [ ] **Step 4: Add `redirectOnSuccess` to `handleSubmit`'s `useCallback` dependency array**

At the bottom of `handleSubmit` (line 188), update the deps:

```tsx
    [email, password, intl, reloadOnSuccess, redirectOnSuccess],
```

- [ ] **Step 5: Typecheck**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn typecheck`
Expected: exits 0, no errors.

- [ ] **Step 6: Lint the modified file**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn lint -- src/components/auth/Signin.tsx`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/next/src/components/auth/Signin.tsx
git commit -m "feat(next): add redirectOnSuccess prop to Signin"
```

---

### Task 2: Plumb `redirectOnSuccess` through `AuthDialog`

**Files:**

- Modify: `packages/next/src/components/auth/AuthDialog.tsx`

- [ ] **Step 1: Extend `AuthDialogProps`**

In `packages/next/src/components/auth/AuthDialog.tsx` at lines 23–27, add the new prop:

```tsx
interface AuthDialogProps {
  children?: ReactNode;
  agenda?: { slug: string; uid: string };
  reloadOnSuccess?: boolean;
  redirectOnSuccess?: string;
}
```

- [ ] **Step 2: Destructure and pass through to `Signin`**

Update the component at lines 29–33 and the `Signin` usage at lines 60–64:

```tsx
export default function AuthDialog({
  children,
  agenda,
  reloadOnSuccess,
  redirectOnSuccess,
}: AuthDialogProps) {
```

```tsx
<Dialog.Body>
  <Signin
    agenda={agenda}
    reloadOnSuccess={reloadOnSuccess}
    redirectOnSuccess={redirectOnSuccess}
    onViewChange={setView}
  />
</Dialog.Body>
```

- [ ] **Step 3: Typecheck**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn typecheck`
Expected: exits 0.

- [ ] **Step 4: Lint**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn lint -- src/components/auth/AuthDialog.tsx`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/next/src/components/auth/AuthDialog.tsx
git commit -m "feat(next): plumb redirectOnSuccess through AuthDialog"
```

---

### Task 3: Add Storybook story for the `redirectOnSuccess` branch

Purpose: provide a visual/manual verification target now that no unit-test runner is wired up in this package.

**Files:**

- Modify: `packages/next/stories/components/auth/Signin.stories.tsx`

- [ ] **Step 1: Add a story that exercises the new prop**

At the end of `packages/next/stories/components/auth/Signin.stories.tsx` (after the `ServerError` story, before `InDialog`), append:

```tsx
export function RedirectOnSuccess() {
  return <Signin redirectOnSuccess="/example-agenda/contribute" />;
}

RedirectOnSuccess.parameters = {
  msw: {
    handlers: [
      http.post('/signin', () =>
        HttpResponse.json({
          success: true,
          redirect: '/home',
        }),
      ),
    ],
  },
};
```

This story proves `redirectOnSuccess` takes precedence over the server-provided `/home` redirect. Submitting valid-looking credentials should navigate the iframe to `/example-agenda/contribute`.

- [ ] **Step 2: Typecheck**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn typecheck`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add packages/next/stories/components/auth/Signin.stories.tsx
git commit -m "test(next): Signin story for redirectOnSuccess"
```

---

### Task 4: Create `ContributeButton` component

**Files:**

- Create: `packages/next/src/views/AgendaShow/components/ContributeButton.tsx`

- [ ] **Step 1: Write the component**

Create `packages/next/src/views/AgendaShow/components/ContributeButton.tsx` with this content:

```tsx
import NextLink from 'next/link';
import { defineMessages, useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { Button, Link } from '@openagenda/uikit';
import { faPlus } from 'icons/solid';
import { FaIcon } from 'icons';
import AuthDialog from 'components/auth/AuthDialog';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';

const messages = defineMessages({
  addEvent: {
    id: 'next.views.AgendaShow.AgendaHeader.addEvent',
    defaultMessage: 'Add an event',
  },
});

interface ContributeButtonProps {
  agenda: { slug: string; uid: string };
}

export default function ContributeButton({ agenda }: ContributeButtonProps) {
  const intl = useIntl();
  const [cookies] = useCookies();
  const sessionUser = getSession(cookies)?.user;

  const contributeHref = hrefWithLang(
    `/${agenda.slug}/contribute`,
    sessionUser ? null : intl.locale,
  );

  if (sessionUser) {
    return (
      <Button asChild>
        <Link unstyled href={contributeHref}>
          <FaIcon icon={faPlus} />
          {intl.formatMessage(messages.addEvent)}
        </Link>
      </Button>
    );
  }

  return (
    <AuthDialog
      agenda={{ slug: agenda.slug, uid: agenda.uid }}
      redirectOnSuccess={contributeHref}
    >
      <Button>
        <FaIcon icon={faPlus} />
        {intl.formatMessage(messages.addEvent)}
      </Button>
    </AuthDialog>
  );
}
```

Notes:

- The message id is **preserved** as `next.views.AgendaShow.AgendaHeader.addEvent` so existing translations apply; only the defining file moves.
- `NextLink` isn't actually used here (the `Link` from uikit wraps the href). Drop the import if your tsconfig's `noUnusedLocals` is strict — verify in step 2.

- [ ] **Step 2: Drop unused `NextLink` import if present**

The `Link` from `@openagenda/uikit` (with `unstyled href=`) replaces the need for `NextLink` in this component. Remove the first import line if `yarn typecheck` flags it as unused:

```tsx
// remove this line:
import NextLink from 'next/link';
```

- [ ] **Step 3: Typecheck**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn typecheck`
Expected: exits 0.

- [ ] **Step 4: Lint**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn lint -- src/views/AgendaShow/components/ContributeButton.tsx`
Expected: no errors.

- [ ] **Step 5: Extract messages (no locale file changes expected)**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn extract-messages`
Expected: no changes to `src/views/AgendaShow/components/ContributeButton/locales/**` (the message id is already defined in `AgendaHeader`'s locale files). Verify with `git status` — `ContributeButton.tsx` should be the only new file.

- [ ] **Step 6: Commit**

```bash
git add packages/next/src/views/AgendaShow/components/ContributeButton.tsx
git commit -m "feat(next): extract ContributeButton with signin dialog support"
```

---

### Task 5: Create `ContactButton` component

**Files:**

- Create: `packages/next/src/views/AgendaShow/components/ContactButton.tsx`

- [ ] **Step 1: Write the component**

Create `packages/next/src/views/AgendaShow/components/ContactButton.tsx`:

```tsx
import qs from 'qs';
import { defineMessages, useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { Button, Link } from '@openagenda/uikit';
import { faEnvelope } from 'icons/solid';
import { FaIcon } from 'icons';
import AuthDialog from 'components/auth/AuthDialog';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';

const messages = defineMessages({
  contact: {
    id: 'next.views.AgendaShow.AgendaHeader.contact',
    defaultMessage: 'Contact',
  },
});

function getMailtoUrl(mailtoSettings) {
  if (!mailtoSettings?.enabled || !mailtoSettings.email) return null;

  return `mailto:${mailtoSettings.email}${qs.stringify(
    {
      subject: mailtoSettings.subject,
      body: mailtoSettings.body,
    },
    { addQueryPrefix: true, skipNulls: true },
  )}`;
}

interface ContactButtonProps {
  agenda: {
    slug: string;
    uid: string;
    settings: { inbox?: { mailto?: Record<string, unknown> } };
  };
}

const outlineStyle = {
  color: 'white',
  borderColor: 'white',
  _hover: {
    bg: 'white',
    borderColor: 'white',
    color: 'primary.500',
    textDecoration: 'none',
  },
} as const;

export default function ContactButton({ agenda }: ContactButtonProps) {
  const intl = useIntl();
  const [cookies] = useCookies();
  const sessionUser = getSession(cookies)?.user;

  const mailtoUrl = getMailtoUrl(agenda.settings.inbox?.mailto);
  const contactHref = hrefWithLang(
    `/${agenda.slug}/contact`,
    sessionUser ? null : intl.locale,
  );

  if (sessionUser || mailtoUrl) {
    return (
      <Button asChild variant="outline" {...outlineStyle}>
        <Link unstyled href={mailtoUrl || contactHref}>
          <FaIcon icon={faEnvelope} />
          {intl.formatMessage(messages.contact)}
        </Link>
      </Button>
    );
  }

  return (
    <AuthDialog
      agenda={{ slug: agenda.slug, uid: agenda.uid }}
      redirectOnSuccess={contactHref}
    >
      <Button variant="outline" {...outlineStyle}>
        <FaIcon icon={faEnvelope} />
        {intl.formatMessage(messages.contact)}
      </Button>
    </AuthDialog>
  );
}
```

Notes:

- Styling is extracted into `outlineStyle` to keep both rendered buttons identical.
- `getMailtoUrl` is moved here verbatim from `AgendaHeader.tsx`; it has no other callers.
- The `agenda.settings.inbox?.mailto` type is intentionally loose (`Record<string, unknown>`) to match the existing pattern in `AgendaHeader`. If the TS compiler complains because `agenda` is untyped in `AgendaHeader`, revisit — but the current file also has no explicit prop type for `agenda`, so loose is consistent.

- [ ] **Step 2: Typecheck**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn typecheck`
Expected: exits 0.

- [ ] **Step 3: Lint**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn lint -- src/views/AgendaShow/components/ContactButton.tsx`
Expected: no errors.

- [ ] **Step 4: Extract messages (verify no locale churn)**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn extract-messages`
Expected: no locale files change — the `contact` id already exists in `AgendaHeader` locale files. `git status` should show only the new component file.

- [ ] **Step 5: Commit**

```bash
git add packages/next/src/views/AgendaShow/components/ContactButton.tsx
git commit -m "feat(next): extract ContactButton with signin dialog support"
```

---

### Task 6: Wire `ContactButton` and `ContributeButton` into `AgendaHeader`

**Files:**

- Modify: `packages/next/src/views/AgendaShow/components/AgendaHeader.tsx`

- [ ] **Step 1: Remove now-unused imports and helpers**

In `packages/next/src/views/AgendaShow/components/AgendaHeader.tsx`:

- Delete the `qs` import at line 1.
- Delete the `useCookies` import at line 5.
- Delete the `NextLink` import at line 3 **only if** it has no remaining usage after the button removals (it's used for the network title link on line 142, so keep it).
- Delete `faEnvelope`, `faPlus` from the icons import at line 21 if they become unused. Leave the other icon imports (`faShareNodes`, `FaIcon`) alone — they are still used by export/aggregate buttons.
- Delete the `hrefWithLang` import at line 30.
- Delete the `getSession` import at line 31.

- [ ] **Step 2: Remove the `getMailtoUrl` helper**

Delete the `getMailtoUrl` function block at lines 57–67. It now lives in `ContactButton`.

- [ ] **Step 3: Remove the `contact` and `addEvent` message definitions**

In the `defineMessages` block (lines 34–55), delete the `contact` (lines 35–38) and `addEvent` (lines 43–46) entries. Keep `officialAgenda`, `aggregate`, and `export`.

- [ ] **Step 4: Remove the session / href / mailto locals from the component body**

Delete these lines inside the `AgendaHeader` function (roughly lines 77 and 100–109):

```tsx
const mailtoUrl = getMailtoUrl(agenda.settings.inbox?.mailto);
```

```tsx
const [cookies] = useCookies();
const sessionUser = getSession(cookies)?.user;
const contactHref = hrefWithLang(
  `/${agenda.slug}/contact`,
  sessionUser ? null : intl.locale,
);
const contributeHref = hrefWithLang(
  `/${agenda.slug}/contribute`,
  sessionUser ? null : intl.locale,
);
```

- [ ] **Step 5: Replace the inline Contact + Contribute buttons with the new components**

In the `<Wrap mt="3" justify="center">` block (lines 180–232), replace the first `<Button asChild>...` (contact) at lines 181–197 and the last `<Button asChild>` (contribute) at lines 226–231 with the component invocations:

```tsx
<Wrap mt="3" justify="center">
  <ContactButton agenda={agenda} />
  <Button
    onClick={exportOnOpen}
    variant="outline"
    color="white"
    borderColor="white"
    _hover={{
      bg: 'white',
      borderColor: 'white',
      color: 'primary.500',
    }}
  >
    <FaIcon icon={faShareNodes} />
    {intl.formatMessage(messages.export)}
  </Button>
  <Button
    onClick={aggregateOnOpen}
    variant="outline"
    color="white"
    borderColor="white"
    _hover={{
      bg: 'white',
      borderColor: 'white',
      color: 'primary.500',
    }}
  >
    <OAIcon size="sm" />
    {intl.formatMessage(messages.aggregate)}
  </Button>
  <ContributeButton agenda={agenda} />
</Wrap>
```

- [ ] **Step 6: Add the new imports**

Add near the bottom of the import block (after the existing relative `./AggregateModal` import around line 32):

```tsx
import ContactButton from './ContactButton';
import ContributeButton from './ContributeButton';
```

- [ ] **Step 7: Typecheck**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn typecheck`
Expected: exits 0, no errors about unused imports or missing references.

- [ ] **Step 8: Lint**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn lint -- src/views/AgendaShow/components/AgendaHeader.tsx`
Expected: no errors.

- [ ] **Step 9: Extract messages (verify nothing disappears)**

Run: `cd /home/kaore/Dev/lib/oa/packages/next && yarn extract-messages`

`git diff src/views/AgendaShow/components/AgendaHeader/locales/` — expected: no changes. The `contact` and `addEvent` ids are still present because they're now defined in the sibling components. Confirm with `git status`.

- [ ] **Step 10: Commit**

```bash
git add packages/next/src/views/AgendaShow/components/AgendaHeader.tsx
git commit -m "feat(next): use ContactButton and ContributeButton in AgendaHeader"
```

---

### Task 7: Manual browser verification

No unit tests exist for this package, so the acceptance gate is a walk through the flows on the dev server. Use two browser profiles / private-window pairs to toggle between signed-out and signed-in states.

**Setup:**

- [ ] Start the full app per the repo's usual `dev` instructions (cibul-node + next). Open an agenda page at `http://localhost:<port>/<slug>`.
- [ ] Prepare one agenda with `settings.inbox.mailto.enabled = true` and one without — you can toggle via the agenda admin settings.

**Scenarios:**

- [ ] Signed-out, agenda without mailto → click **Add an event** → `AuthDialog` opens inline (no page navigation).
- [ ] In the open dialog, submit valid credentials → success state appears briefly → browser navigates to `/<slug>/contribute`.
- [ ] Signed-out → click **Add an event** → submit wrong password → inline error alert appears, dialog stays open, no navigation.
- [ ] Signed-out with an inactive account → submit → server returns `success:false, redirect:/activate/resend?...` → browser navigates to the activation URL (server-mandated detour wins over `redirectOnSuccess`). If you can't reproduce with a real account, verify via the Storybook `AccountNotActivated` scenario and confirm the redirect is still used.
- [ ] Signed-out → click **Add an event** → in the dialog, click **Sign in with Google** → OAuth completes → backend redirects back to `/<slug>/contribute` (via agenda-scoped default in `cibul-node/auth/lib/auth.js`).
- [ ] Signed-in user → click **Add an event** → direct navigation to `/<slug>/contribute`, no dialog.
- [ ] Signed-out, agenda without mailto → click **Contact** → dialog opens → signin → navigate to `/<slug>/contact`.
- [ ] Signed-out, agenda **with mailto** → click **Contact** → browser launches the user's mail client (`mailto:` URL), no dialog.
- [ ] Signed-in → click **Contact** on a non-mailto agenda → direct link to `/<slug>/contact`.

**Regression check — existing `AuthDialog` users must be untouched:**

- [ ] Signed-out → use the **Sign in** button in the top navbar → submit valid credentials → page **reloads** (not navigates), because `ProfileMenu` still uses `reloadOnSuccess` without `redirectOnSuccess`.

- [ ] **Final commit (checklist only if nothing else changed):**

No code commit is needed for this task; it's verification only. If during verification you find issues, address them in targeted follow-up commits rather than amending existing ones.

---

## Self-review summary

Cross-checked against the spec:

- Goal 1 (dialog instead of page nav for signed-out users) — Tasks 4, 5, 6.
- Goal 2 (redirect after signin to the intended target) — Tasks 1, 2 (client-side prop).
- Goal 3 (signed-in behavior unchanged) — Tasks 4, 5 render direct links when `sessionUser` is truthy.
- Goal 4 (mailto bypasses dialog) — Task 5, `sessionUser || mailtoUrl` branch.
- Goal 5 (no regression in `ProfileMenu`) — Task 1 keeps `reloadOnSuccess` behavior untouched; Task 7 regression scenario verifies.
- Non-goal (locale changes) — Tasks 4, 5, 6 preserve message ids; `extract-messages` is run explicitly to prove no churn.

No placeholders, TBDs, or "handle edge cases" language. Every code step shows the actual code. Prop names are consistent (`redirectOnSuccess`) across every task.
