import isEmail from 'isemail';
import buildInboxToAddress from '../services/inboxes/lib/buildInboxToAddress.js';

// The inbox-notification `to` address (`<conversationId>.<slug>@<domain>`) must
// stay a valid RFC 5321 address: the local part is capped at 64 octets, and a
// long agenda slug used to blow past it — `isemail` then rejected the address and
// the notification was silently dropped (Sentry: `VError: Invalid email address`,
// ~1800×/90d). The slug is decorative (nothing parses it back), so we crop it.

const DOMAIN = 'mail.openagenda.com';
const localPart = (addr) => addr.split('@')[0];

describe('buildInboxToAddress', () => {
  test('crops a long slug on a hyphen boundary, keeping whole words', () => {
    const addr = buildInboxToAddress({
      conversationId: 137087,
      slug: 'catalogue-departemental-des-structures-daccueil-et-dhebergement-aude',
      mailsDomain: DOMAIN,
    });

    // whole words only — no partial trailing word like `…et-dheber`
    expect(addr).toBe(
      `137087.catalogue-departemental-des-structures-daccueil-et@${DOMAIN}`,
    );
    expect(localPart(addr).length).toBeLessThanOrEqual(64);
    expect(isEmail.validate(addr)).toBe(true);
  });

  test('hard-cuts when the first word alone exceeds the budget', () => {
    // no hyphen in range to back up to — keep the character cut rather than
    // collapsing to the `inbox` fallback.
    const addr = buildInboxToAddress({
      conversationId: 1,
      slug: 'x'.repeat(80),
      mailsDomain: DOMAIN,
    });

    expect(localPart(addr).length).toBe(64);
    expect(addr).toBe(`1.${'x'.repeat(62)}@${DOMAIN}`);
    expect(isEmail.validate(addr)).toBe(true);
  });

  test('budgets in UTF-8 octets (not code units) and never splits a character', () => {
    // 50 'é' = 50 code units but 100 octets; the limit isemail enforces is octets.
    const addr = buildInboxToAddress({
      conversationId: 1,
      slug: 'é'.repeat(50),
      mailsDomain: DOMAIN,
    });

    expect(Buffer.byteLength(localPart(addr), 'utf8')).toBeLessThanOrEqual(64);
    expect(addr).not.toContain('�'); // no character cut mid-sequence
    expect(isEmail.validate(addr)).toBe(true);
  });

  test('leaves a short slug untouched', () => {
    const addr = buildInboxToAddress({
      conversationId: 42,
      slug: 'my-agenda',
      mailsDomain: DOMAIN,
    });

    expect(addr).toBe(`42.my-agenda@${DOMAIN}`);
    expect(isEmail.validate(addr)).toBe(true);
  });

  test('falls back to "inbox" when there is no slug', () => {
    const addr = buildInboxToAddress({
      conversationId: 42,
      slug: null,
      mailsDomain: DOMAIN,
    });

    expect(addr).toBe(`42.inbox@${DOMAIN}`);
  });

  test('does not leave a dangling separator after cropping', () => {
    // budget falls inside the trailing word (prefix `1.` = 2, budget = 62): the
    // crop backs up to the hyphen at index 61, so the local part ends on a word.
    const addr = buildInboxToAddress({
      conversationId: 1,
      slug: `${'a'.repeat(61)}-${'b'.repeat(10)}`,
      mailsDomain: DOMAIN,
    });

    expect(localPart(addr)).not.toMatch(/[-.]$/);
    expect(localPart(addr).length).toBeLessThanOrEqual(64);
    expect(isEmail.validate(addr)).toBe(true);
  });
});
