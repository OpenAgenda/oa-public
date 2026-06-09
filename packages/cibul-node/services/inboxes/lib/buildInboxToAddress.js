// The `to` address of an inbox-notification mail: `<conversationId>.<slug>@<domain>`.
// The `conversationId` prefix is what makes the address unique per conversation
// (so recipients' mail clients group the thread); the slug is purely decorative
// — no inbound code parses it back (replies route via the References header and
// the `reply+<token>@` address). For agendas with long slugs the local part used
// to exceed RFC 5321's 64-octet limit, so `isemail` rejected the address and the
// notification was silently dropped (logged as `VError: Invalid email address`).
// We therefore crop the decorative slug to keep the local part within the limit.
// Slugs are hyphen-delimited words, so we crop on a hyphen boundary to keep whole
// words (`…daccueil-et` reads as the agenda; `…et-dheber` reads as a glitch),
// falling back to a hard character cut when the first word alone overflows. Any
// separator the crop leaves dangling is trimmed so the result stays valid.
//
// The budget is measured in UTF-8 octets, not characters: that is the unit RFC
// 5321 (and `isemail`, via Buffer.byteLength) actually enforces. Slugs generated
// by slugify({ strict: true }) are ASCII so the two coincide, but a legacy/
// imported multi-byte slug would otherwise slip past a code-unit budget and be
// rejected again. We crop on code-point boundaries so a character is never split.
const MAX_LOCAL_PART = 64; // RFC 5321 §4.5.3.1.1

// Longest prefix of `str` whose UTF-8 length is ≤ budget octets, cut only on
// code-point boundaries (iterating the string yields whole code points).
function cropToOctets(str, budget) {
  if (Buffer.byteLength(str, 'utf8') <= budget) return str;
  let used = 0;
  let out = '';
  for (const ch of str) {
    const size = Buffer.byteLength(ch, 'utf8');
    if (used + size > budget) break;
    used += size;
    out += ch;
  }
  return out;
}

function cropSlug(slug, budget) {
  if (budget <= 0) return '';
  if (Buffer.byteLength(slug, 'utf8') <= budget) return slug;
  const slice = cropToOctets(slug, budget);
  const lastHyphen = slice.lastIndexOf('-');
  // back up to the last whole word, unless that would drop everything (the first
  // word is itself longer than the budget) — then keep the hard character cut.
  const cropped = lastHyphen > 0 ? slice.slice(0, lastHyphen) : slice;
  return cropped.replace(/[-.]+$/, '');
}

export default function buildInboxToAddress({ conversationId, slug, mailsDomain }) {
  const prefix = `${conversationId}.`;
  const budget = MAX_LOCAL_PART - Buffer.byteLength(prefix, 'utf8');
  const label = cropSlug(slug || 'inbox', budget) || 'inbox';
  return `${prefix}${label}@${mailsDomain}`;
}
