# UI guidelines

Conventions and design principles for UI work in `packages/next`. Add to this file whenever a decision is worth keeping consistent across components.

## Dialog dismissal

A dialog's dismissal behavior should match the cost of losing what's inside it.

- **Lightweight content** (sign in, single-action prompts, read-only info): outside-click and `Escape` both dismiss. This is the Chakra/Ark default.
- **Forms with meaningful user input** (sign up, multi-field forms, anything the user has been typing into) and **critical information screens** (post-submission confirmations the user may need to read or act on): require an explicit close action. Disable outside-click dismissal via `closeOnInteractOutside={false}` on `Dialog.Root`. Keep `Escape` enabled — it's a deliberate keypress, not an accident, and disabling it breaks keyboard-accessibility expectations.

When a single dialog hosts multiple views with different dismissal needs (e.g. `AuthDialog` toggling between `signin`, `signup`, and `signupComplete`), compute `closeOnInteractOutside` from the current view rather than picking one global behavior. See `packages/next/src/components/auth/AuthDialog.tsx`.
