// Where to book, read from what the event read serves: the catalogue's links
// (`offersAggregate.links`, one per ticketing source) and a date's rows
// (`timings[].availability`, whose `bookingUrl` is that date's own page). The
// one rule for every surface that links to a booking page, the event page and
// the JSON-LD alike: a search engine should not be sent where a visitor is not.

// An address worth linking to: an absolute http or https URL, nothing else,
// served as given but for surrounding spaces (the parsed form would turn an
// accented host into punycode on the page). The write cleans these
// URLs, but a link rendered as an `href` is no place to delegate trust: a
// `javascript:` that got past those checks one day would run in the page.
export function httpUrl(value) {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  try {
    const trimmed = value.trim();
    const { protocol } = new URL(trimmed);

    // A blank or control character inside is dropped by the parser, so the
    // string we would serve is not the one checked: refused instead.
    // eslint-disable-next-line no-control-regex
    if (/[\s\x00-\x1f\x7f]/.test(trimmed)) {
      return null;
    }

    return protocol === 'https:' || protocol === 'http:' ? trimmed : null;
  } catch {
    return null;
  }
}

// The catalogue link of one provider, or null.
//
// TWO SHOPS OF ONE PROVIDER CANNOT BE TOLD APART, and that case gives no link
// rather than a random one. A source is deduplicated by provider and source
// reference on write, so an event may carry two Billetweb shops, and the
// summary then lists two `billetweb` links. A row carries only its provider,
// so nothing says which of the two sells the date: taking the first sent the
// visitor to a shop that does not. The same link repeated is not ambiguous.
export function providerBookingUrl(links, provider) {
  if (!provider || !Array.isArray(links)) {
    return null;
  }

  // Compared as parsed: two spellings of one shop (a trailing slash) are one.
  const sameShop = (a, b) => {
    try {
      return new URL(a.trim()).href === new URL(b.trim()).href;
    } catch {
      return a === b;
    }
  };

  const matches = links.filter(
    (link) => link?.provider === provider && typeof link.url === 'string',
  );

  const [match] = matches;

  if (!match?.url || matches.some((link) => !sameShop(link.url, match.url))) {
    return null;
  }

  return httpUrl(match.url);
}

// A row's link, most precise first: the date's own page wins over the
// provider's catalogue link, and is the only answer when the provider sells
// through two shops. `perDate` says which one it is, since a label promising
// "this date" must not lead to the event's page.
export function rowBookingUrl(row, links) {
  const perDate = httpUrl(row?.bookingUrl);

  if (perDate) {
    return { url: perDate, perDate: true };
  }

  const event = providerBookingUrl(links, row?.provider);

  return event ? { url: event, perDate: false } : null;
}
