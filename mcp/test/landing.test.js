import { LOCALES, landingPage, parisWeek, pickLocale } from '../src/landing.js';
import en from '../src/locales/en.json' with { type: 'json' };
import br from '../src/locales/br.json' with { type: 'json' };
import de from '../src/locales/de.json' with { type: 'json' };
import es from '../src/locales/es.json' with { type: 'json' };
import fr from '../src/locales/fr.json' with { type: 'json' };
import italian from '../src/locales/it.json' with { type: 'json' };
import nl from '../src/locales/nl.json' with { type: 'json' };
import oc from '../src/locales/oc.json' with { type: 'json' };

const resourceUrl = 'https://mcp.test/mcp';
const translations = { br, de, es, fr, it: italian, nl, oc };

describe('landing page', () => {
  // What a translation may not change: the page interpolates the placeholders
  // and renders the tags as HTML, so a tag is compared whole, attributes included.
  const markup = (message) =>
    [...message.matchAll(/\{\w+\}|<[^>]*>/g)].map((m) => m[0]).sort();

  describe.each(Object.entries(translations))('%s', (locale, messages) => {
    it('has the keys of the source, none empty', () => {
      expect(Object.keys(messages).sort()).toEqual(Object.keys(en).sort());
      expect(Object.values(messages).every(Boolean)).toBe(true);
    });

    it('keeps the placeholders and tags of the source', () => {
      for (const [key, message] of Object.entries(en)) {
        expect([key, markup(messages[key])]).toEqual([key, markup(message)]);
      }
    });

    it('renders with no placeholder left', () => {
      const html = landingPage({ resourceUrl, locale, isolated: true });
      expect(html).toContain(`<html lang="${locale}">`);
      // The page's own CSS and JS hold braces of their own.
      const text = html.replace(/<(style|script)>[\s\S]*?<\/\1>/g, '');
      expect(text).not.toMatch(/\{\w+\}/);
    });
  });

  it('offers every language it has', () => {
    const html = landingPage({ resourceUrl });
    for (const locale of LOCALES) {
      expect(html).toContain(`href="/?lang=${locale}"`);
    }
  });

  it('promises isolation only when the deployment has it', () => {
    const promise = en['control.isolated.title'];
    expect(landingPage({ resourceUrl, isolated: true })).toContain(promise);
    expect(landingPage({ resourceUrl, isolated: false })).not.toContain(
      promise,
    );
  });

  it('gives every copy button a target, and every connection command a button', () => {
    const html = landingPage({ resourceUrl });
    const targets = [...html.matchAll(/data-copy="([^"]+)"/g)].map((m) => m[1]);

    expect(targets).toEqual(
      expect.arrayContaining([
        'addmcp',
        'claudecode-cmd',
        'cursor-config',
        'vscode-cmd',
      ]),
    );
    for (const target of targets) {
      expect(html).toContain(`id="${target}"`);
    }
  });

  it.each([true, false])(
    'names the two tools and keeps the AI provider note, isolation card or not (isolated: %s)',
    (isolated) => {
      const html = landingPage({ resourceUrl, isolated });
      expect(html).toContain('<code class="tool">search_docs</code>');
      expect(html).toContain('<code class="tool">execute</code>');
      expect(html).toContain(`<p class="note">${en['control.privacy']}</p>`);
    },
  );

  it('links the privacy policy from the footer, marked as French', () => {
    const html = landingPage({ resourceUrl, locale: 'de' });
    const links = html.match(
      /<a href="https:\/\/doc\.openagenda\.com\/confidentialite\/" hreflang="fr">/g,
    );
    expect(links).toHaveLength(1);
  });

  it('links the API reference, the help centre and the support address', () => {
    const html = landingPage({ resourceUrl, locale: 'fr' });
    expect(
      html.match(/href="https:\/\/api\.openagenda\.com\/v3"/g),
    ).toHaveLength(2);
    expect(html).toContain('href="https://doc.openagenda.com"');
    expect(html).toContain(
      '<a href="mailto:support@openagenda.com">support@openagenda.com</a>',
    );
  });

  it('describes itself to link previews, in the language of the page', () => {
    const html = landingPage({ resourceUrl, locale: 'de' });
    const og = (property) =>
      new RegExp(`<meta property="og:${property}" content="([^"]*)">`).exec(
        html,
      )?.[1];
    expect(og('title')).toBe(de['meta.title']);
    expect(og('description')).toBe(de['meta.description']);
    expect(og('url')).toBe('https://mcp.test/?lang=de');
    expect(og('locale')).toBe('de');
    expect(og('image')).toBe('https://mcp.test/assets/og.png');
    expect(html).toContain(
      '<meta name="twitter:card" content="summary_large_image">',
    );
  });

  it('names its canonical address and its default language', () => {
    const html = landingPage({ resourceUrl, locale: 'fr' });
    expect(html).toContain(
      '<link rel="canonical" href="https://mcp.test/?lang=fr">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://mcp.test/">',
    );
  });

  it.each(LOCALES)(
    'keeps the %s title short enough not to be cut',
    (locale) => {
      const messages = locale === 'en' ? en : translations[locale];
      expect(messages['meta.title'].length).toBeLessThanOrEqual(60);
    },
  );

  it('escapes the endpoint it injects', () => {
    const html = landingPage({ resourceUrl: 'https://mcp.test/mcp?a="<b>' });
    expect(html).not.toContain('"<b>');
  });

  describe('parisWeek', () => {
    it('spans the Monday to Sunday of the request, in Paris time', () => {
      expect(parisWeek(new Date('2026-11-04T10:00:00Z'))).toEqual({
        gte: '2026-11-02T00:00:00+01:00',
        lte: '2026-11-08T23:59:59+01:00',
      });
    });

    it('turns to the next week at midnight in Paris, not in UTC', () => {
      // Sunday 23:30 and Monday 00:30 in Paris.
      expect(parisWeek(new Date('2026-11-08T22:30:00Z')).gte).toBe(
        '2026-11-02T00:00:00+01:00',
      );
      expect(parisWeek(new Date('2026-11-08T23:30:00Z')).gte).toBe(
        '2026-11-09T00:00:00+01:00',
      );
    });

    it('gives each bound its own offset in a week that changes the clocks', () => {
      expect(parisWeek(new Date('2026-10-21T10:00:00Z'))).toEqual({
        gte: '2026-10-19T00:00:00+02:00',
        lte: '2026-10-25T23:59:59+01:00',
      });
    });

    it('puts the week of the request in the example code', () => {
      const html = landingPage({
        resourceUrl,
        now: new Date('2027-03-10T12:00:00Z'),
      });
      expect(html).toContain('2027-03-08T00:00:00+01:00');
      expect(html).not.toContain('2026-11-02');
    });
  });

  describe('pickLocale', () => {
    it('takes a known ?lang= first, then the negotiated one, then English', () => {
      expect(pickLocale('de', 'fr')).toBe('de');
      expect(pickLocale(undefined, 'fr')).toBe('fr');
      expect(pickLocale(undefined, false)).toBe('en');
    });

    it('ignores what is not a language it has', () => {
      expect(pickLocale('xx', 'fr')).toBe('fr');
      expect(pickLocale(['de'], 'fr')).toBe('fr');
      expect(pickLocale('constructor', false)).toBe('en');
    });
  });
});
