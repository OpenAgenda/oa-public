import { LOCALES, landingPage, pickLocale } from '../src/landing.js';
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
      expect(html).not.toMatch(/\{(name|command|path|metadata|pk|sk)\}/);
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

  it('escapes the endpoint it injects', () => {
    const html = landingPage({ resourceUrl: 'https://mcp.test/mcp?a="<b>' });
    expect(html).not.toContain('"<b>');
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
