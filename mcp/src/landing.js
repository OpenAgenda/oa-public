// Human-facing landing page for the MCP server root (`GET /`). The MCP protocol
// endpoint lives at `POST /mcp` (Streamable HTTP); serving it off the root frees
// the subdomain root for a page a browser visitor — or a dev pasting the URL —
// actually wants, instead of the bare 401/JSON-RPC challenge the protocol
// endpoint returns. Plain string template, no framework: this package ships no
// view layer and the page is static but for the endpoint URL, the language and
// the sandbox posture.
//
// The texts live in `locales/`, with `en.json` as the source sent to Crowdin
// (public/crowdin.yml). A message may hold `<em>`, `<strong>` or `<a>`, so it is
// written as HTML; only the values it interpolates are escaped.

import { highlight } from 'sugar-high';
import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import pkg from '../package.json' with { type: 'json' };
import {
  checkIcon,
  chevronIcon,
  githubIcon,
  globeIcon,
  langIcon,
  logo,
  personIcon,
  shieldIcon,
  sketch,
  stepRing,
  whiteLogo,
} from './landingArt.js';
import br from './locales/br.json' with { type: 'json' };
import de from './locales/de.json' with { type: 'json' };
import en from './locales/en.json' with { type: 'json' };
import es from './locales/es.json' with { type: 'json' };
import fr from './locales/fr.json' with { type: 'json' };
import it from './locales/it.json' with { type: 'json' };
import nl from './locales/nl.json' with { type: 'json' };
import oc from './locales/oc.json' with { type: 'json' };

// English first: it is what negotiation answers for a client with no preference.
const MESSAGES = { en, fr, de, es, it, nl, br, oc };

export const LOCALES = Object.keys(MESSAGES);

const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  br: 'Brezhoneg',
  oc: 'Occitan',
};

const SOURCE_URL = 'https://github.com/OpenAgenda/oa-public/tree/main/mcp';
const NPM_URL = 'https://www.npmjs.com/package/@openagenda/mcp';
const SDK_URL = 'https://www.npmjs.com/package/@openagenda/api-client';
// The v3 reference: the same documentation `search_docs` reads.
const API_DOCS_URL = 'https://api.openagenda.com/v3';
// What openagenda.com's help button opens; it redirects to the visitor's language.
const HELP_URL = 'https://doc.openagenda.com';
const SUPPORT_EMAIL = 'support@openagenda.com';
// The alias the sign-up form links to; the policy exists in French only.
const PRIVACY_URL = 'https://doc.openagenda.com/confidentialite/';

// One-click Claude Desktop bundle for the LOCAL (API-key) path — pinned to this
// server's version, whose release uploads the asset (see release.yml). The tag
// is scoped (@openagenda/mcp@x); encoded as GitHub serves it: @ → %40, the slash
// stays literal.
const MCPB_URL = `https://github.com/OpenAgenda/oa-public/releases/download/%40openagenda/mcp%40${pkg.version}/openagenda.mcpb`;

// A real week of the Nantes Métropole agenda: an example, so neither its titles
// nor its venues are translated.
const FIND_EVENTS = [
  {
    image: 'c83fac7d99534eba8c0d6170f5e82d16',
    title: 'Helena - La 1ère tournée',
    where: 'Zénith de Nantes Métropole, Saint-Herblain',
    price: '39 - 69 €',
  },
  {
    image: 'fe1be0ca6b6a43daaf66305f420ab79a',
    title: 'Syd Matters + Dear March',
    where: 'Stereolux, Nantes',
    price: '19,80 €',
  },
  {
    image: '5f19dbab69ef438985c07b5fc5f0ea5a',
    title: 'Wallace Cleaver + Ellie Becker',
    where: 'Stereolux, Nantes',
    price: '27 €',
  },
  {
    image: 'c3a8de29b56042d38ad332152d1bacae',
    title: "Stephan Eicher : Poussière d'Or",
    where: 'LAPS, Nantes',
    price: '30 - 60 €',
  },
];

const PARIS = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZoneName: 'longOffset',
});

/**
 * The week of `now` in Paris time, Monday to Sunday, as the bounds the API takes:
 * the question asks for "this week", so the code must not age into the past.
 * Each bound carries its own day's offset, a week may change the clocks.
 *
 * @param {Date} now
 * @returns {{ gte: string, lte: string }}
 */
export function parisWeek(now) {
  const parts = (date) =>
    Object.fromEntries(PARIS.formatToParts(date).map((p) => [p.type, p.value]));
  const today = parts(now);
  // Days since Monday, from the date itself rather than a formatted name.
  const shift = (new Date(Date.UTC(+today.year, +today.month - 1, +today.day)).getUTCDay()
      + 6)
    % 7;
  // Noon, so a clock change in the night never moves the day.
  const day = (offset) => {
    const p = parts(
      new Date(
        Date.UTC(+today.year, +today.month - 1, +today.day + offset, 12),
      ),
    );
    return {
      date: `${p.year}-${p.month}-${p.day}`,
      offset: p.timeZoneName.replace('GMT', '') || '+00:00',
    };
  };
  const monday = day(-shift);
  const sunday = day(6 - shift);
  return {
    gte: `${monday.date}T00:00:00${monday.offset}`,
    lte: `${sunday.date}T23:59:59${sunday.offset}`,
  };
}

const findCode = ({
  gte,
  lte,
}) => `const { data: page, error } = await oa.agendas.events.list({
  path: { agendaUid: 82470621 },
  query: {
    search: 'concert',
    timings: {
      gte: '${gte}',
      lte: '${lte}',
    },
    sort: 'timings.asc',
  },
});

if (error) throw error;

return page.data;`;

const SDK_CODE = `import { OpenAgenda, client } from '@openagenda/api-client';

client.setConfig({
  baseUrl: 'https://api.openagenda.com/v3',
  auth: 'oa_pk_…',
});

const oa = new OpenAgenda();`;

// The values come from the site and from uikit's tokens (public/uikit/src/theme):
// this package has no Chakra to read them from.
const STYLES = `
@font-face { font-family: "Ubuntu Sans"; src: url("/assets/fonts/ubuntu-sans-latin.woff2") format("woff2"); font-weight: 500 700; font-display: swap; }
@font-face { font-family: "Noto Sans"; src: url("/assets/fonts/noto-sans-latin.woff2") format("woff2"); font-weight: 400 700; font-display: swap; }
:root {
  color-scheme: light;
  --primary: #1d77ce;      /* uikit primary.500 */
  --primary-dark: #1560a7; /* primary.600: the hover shade, and small text on tints */
  --primary-soft: #ebf1fe; /* primary.50 */
  --primary-subtle: #d7e3fe; /* primary.100 */
  --primary-line: #acc7fc; /* primary.200 */
  --ink: #09090b;
  --muted: #52525b;
  --line: #e4e4e7;
  --bg: #ffffff;
  --band-warm: #ffeecb;    /* measured on the site's "Agendas à la une" band */
  --band-cool: #f4f9ff;    /* measured on the site's alternate bands */
  --hero-end: #f0f4ff;     /* measured on the site's hero */
  --foot: #333333;         /* uikit oaGray.900 */
  --heading: "Ubuntu Sans", Helvetica, -apple-system, "Segoe UI", Arial, sans-serif;
  --body: "Noto Sans", Helvetica, -apple-system, "Segoe UI", Arial, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  --r: 4px;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { margin: 0; background: var(--bg); color: var(--ink); font: 400 1rem/1.5 var(--body); }
a { color: var(--primary); }
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: var(--r); }
code { font-family: var(--mono); font-size: .92em; }
.wrap { max-width: 72rem; margin-inline: auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2, h3 { font-family: var(--heading); text-wrap: balance; margin: 0; }
h2 { font-size: clamp(1.75rem, 3.4vw, 2.25rem); line-height: 1.22; font-weight: 700; }
h3 { font-size: 1.05rem; line-height: 1.3; font-weight: 700; }

/* Buttons: the site's solid and outline pair */
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 20px; border-radius: var(--r); border: 1px solid transparent; font: 500 1rem/1.2 var(--body); text-decoration: none; cursor: pointer; }
.btn, .pill, .linkbtn, .lang summary, .urlbox button, .snippet button, .tabs button { transition: background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease; }
.btn-solid { background: var(--primary); color: #fff; }
.btn-solid:hover { background: var(--primary-dark); }
.btn-outline { background: #fff; color: var(--primary); border-color: var(--primary-line); }
.btn-outline:hover { background: var(--primary-soft); color: var(--primary-dark); }
.btn-sm { min-height: 36px; padding: 0 14px; font-size: .92rem; }

/* Nav */
.nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 60px; }
.brand { display: flex; align-items: center; gap: .55rem; text-decoration: none; color: var(--ink); font-family: var(--heading); font-weight: 600; }
.brand svg { height: 24px; width: auto; display: block; }
.nav-links { display: flex; align-items: center; gap: 1.5rem; }
.nav-links a { text-decoration: none; }
.pill { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border: 1px solid var(--primary-line); border-radius: 9999px; color: var(--primary); font: 500 14px/20px var(--body); }
.pill:hover { background: var(--primary-subtle); }
.gh, .nav-icon { width: 16px; height: 16px; display: block; flex: none; }

/* Hero */
.hero { background: linear-gradient(to right bottom, #fff, #fff, #fff, var(--hero-end)); }
.hero-in { padding-block: clamp(1.5rem, 4vw, 3rem) clamp(2.5rem, 5vw, 4rem); text-align: center; }
h1 { font-size: clamp(2rem, 4.6vw, 3rem); line-height: 1.25; font-weight: 600; max-width: 56rem; margin-inline: auto; }
h1 em { font-style: normal; color: var(--primary); }
.lede { max-width: 44rem; margin: 1.5rem auto 0; font-size: 1.05rem; text-wrap: pretty; }
.sketch { display: block; width: min(100%, 46rem); height: auto; margin: 2rem auto; }
.cta { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; }
.addr { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .25rem .6rem; margin: 1.25rem 0 0; font-size: .92rem; color: var(--muted); }
.addr code { color: var(--ink); white-space: nowrap; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.lang { position: relative; }
.lang summary { display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border-radius: var(--r); color: var(--primary); font: 500 14px/20px var(--body); list-style: none; }
.lang summary::-webkit-details-marker { display: none; }
.lang summary:hover, .lang[open] summary { background: var(--primary-subtle); }
.lang ul { position: absolute; right: 0; z-index: 10; min-width: 128px; margin: 8px 0 0; padding: 6px; list-style: none; background: #fff; border-radius: var(--r); box-shadow: 0 8px 16px rgb(24 24 27 / 10%), 0 0 1px rgb(24 24 27 / 30%); }
.lang[open] ul { animation: menu-in .15s ease; }
@keyframes menu-in { from { opacity: 0; translate: 0 -.5rem; } }
.lang li a { display: block; padding: 6px 8px; border-radius: 2px; color: var(--ink); font-size: 14px; line-height: 20px; white-space: nowrap; }
.lang li a:hover { background: color-mix(in srgb, var(--primary-subtle) 30%, transparent); }
.lang a[aria-current] { color: var(--muted); }
@media (max-width: 480px) { .nav { gap: .5rem; } .nav-links { gap: .25rem; } .lang summary { padding: 0 8px; } .pill span { display: none; } .pill { width: 36px; padding: 0; justify-content: center; } }
@media (max-width: 359px) { .lang-name { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; } }
.linkbtn { background: none; border: 0; padding: .25rem; color: var(--primary); font: 500 .92rem var(--body); cursor: pointer; text-decoration: underline; }

/* Examples */
.band { padding-block: clamp(2.5rem, 5vw, 4rem); }
.band-warm { background: var(--band-warm); }
.band-cool { background: var(--band-cool); }
.center { text-align: center; }
.sub { max-width: 44rem; margin: .75rem auto 0; }
.seg { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; margin: 1.5rem 0 1.25rem; }
.seg button[aria-selected="true"] { background: var(--primary); color: #fff; border-color: var(--primary); }
.convo { max-width: 50rem; margin-inline: auto; background: #fff; border-radius: 8px; padding: clamp(1rem, 3vw, 1.75rem); }
.ask { margin-top: 0; width: fit-content; max-width: 90%; margin-left: auto; background: var(--primary-soft); padding: .6rem 1rem; border-radius: 12px 12px 2px 12px; font-weight: 500; }
.says { margin: 1.1rem 0 .5rem; font-weight: 600; }
.ev { display: grid; grid-template-columns: 64px minmax(0, 1fr); grid-template-areas: "img title" "img meta" "img price"; gap: .1rem .9rem; align-items: center; padding-block: .7rem; border-top: 1px solid var(--line); }
.ev img { grid-area: img; width: 64px; height: 64px; object-fit: cover; border-radius: var(--r); display: block; align-self: start; }
.ev-t { grid-area: title; font-family: var(--heading); font-weight: 700; line-height: 1.3; }
.ev-m { grid-area: meta; color: var(--muted); font-size: .92rem; }
.ev-p { grid-area: price; font-size: .92rem; font-weight: 500; font-variant-numeric: tabular-nums; }
@media (min-width: 640px) {
  .ev { grid-template-columns: 64px minmax(0, 1fr) auto; grid-template-areas: "img title price" "img meta price"; }
  .ev img { align-self: center; }
  .ev-t { align-self: end; }
  .ev-m { align-self: start; }
}
.more { border-top: 1px solid var(--line); padding-top: .75rem; margin: 0; }
.checks { list-style: none; margin: .5rem 0 0; padding: 0; display: grid; gap: .5rem; }
.checks li { position: relative; padding-left: 1.2rem; }
.checks li::before { content: ""; position: absolute; left: .15rem; top: .62em; width: .4rem; height: .4rem; border-radius: 50%; background: var(--ink); }
.convo details { margin-top: .75rem; }
summary { cursor: pointer; color: var(--primary); font-weight: 500; }
pre { margin: .6rem 0 0; padding: .85rem 1rem; background: #f4f4f5; border-radius: var(--r); overflow-x: auto; font-size: .84rem; line-height: 1.55; }
pre code { font-size: 1em; }
pre { --sh-identifier: var(--ink); --sh-sign: var(--muted); --sh-comment: var(--muted); --sh-keyword: var(--primary-dark); --sh-class: var(--primary-dark); --sh-entity: var(--primary-dark); --sh-property: #3f3f46; --sh-string: #0f766e; --sh-jsxliterals: var(--ink); }
.snippet { position: relative; margin-top: .6rem; }
.snippet pre { margin: 0; padding-right: 6rem; scrollbar-width: thin; }
.snippet::after { content: ""; position: absolute; top: 0; right: 0; width: 6rem; height: 2.9rem; background: linear-gradient(to right, transparent, #f4f4f5 1.25rem); border-top-right-radius: var(--r); pointer-events: none; }
.snippet button { position: absolute; z-index: 1; top: .45rem; right: .45rem; padding: .2rem .55rem; background: #fff; border: 1px solid var(--primary-line); border-radius: var(--r); color: var(--primary); font: 500 .8rem var(--body); cursor: pointer; }
.snippet button:hover { background: var(--primary-soft); }
[role="tabpanel"]:not([hidden]) { animation: show .22s cubic-bezier(.22, 1, .36, 1); }
@keyframes show { from { opacity: .4; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { [role="tabpanel"]:not([hidden]), .lang[open] ul { animation: none; } .btn, .pill, .linkbtn, .lang summary, .urlbox button, .snippet button, .tabs button { transition: none; } }

/* How it works: one rail, from the connection to the answer */
#how .sub { text-wrap: balance; }
.flow { list-style: none; max-width: 62rem; margin: clamp(2rem, 4vw, 3rem) auto 0; padding: 0; }
.step { position: relative; display: grid; grid-template-columns: 2.75rem minmax(0, 1fr); column-gap: 1.1rem; padding-bottom: clamp(2rem, 4vw, 3rem); }
.step:last-child { padding-bottom: 0; }
.step:not(:last-child)::before { content: ""; position: absolute; left: calc(1.375rem - 1px); top: 3.1rem; bottom: .35rem; width: 2px; border-radius: 2px; background: var(--primary-line); transform-origin: top; }
.node { grid-row: 1 / span 2; position: relative; width: 2.75rem; height: 2.75rem; display: grid; place-items: center; color: var(--primary); }
.node svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.node span { position: relative; font: 700 1.05rem/1 var(--heading); color: var(--primary-dark); }
.step-text { padding-top: .45rem; }
.step-text p { margin: .35rem 0 0; max-width: 30rem; text-wrap: pretty; }
.step-text .steplink { margin-top: .6rem; font-weight: 500; }
.shot { margin-top: 1rem; min-width: 0; background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: .9rem 1rem; box-shadow: 0 1px 2px rgb(24 24 27 / 5%); }
@media (min-width: 860px) {
  .step { grid-template-columns: 2.75rem minmax(0, 5fr) minmax(0, 6fr); }
  .node { grid-row: 1; }
  .shot { margin: 0 0 0 1.75rem; grid-column: 3; grid-row: 1; }
}
.tool { display: inline-block; padding: .1rem .45rem; background: var(--primary-soft); border-radius: var(--r); color: var(--primary-dark); font-weight: 600; }
.shot-head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-bottom: .6rem; font-size: .85rem; color: var(--muted); }
.shot .ask { margin: 0 0 0 auto; }
.shot pre { margin: 0; font-size: .8rem; }
.shot-code { padding: 0; border: 0; background: #f4f4f5; box-shadow: none; }
.shot-code pre { padding: 1rem 1.1rem; background: none; }
.linked { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem .75rem; }
.linked code { min-width: 0; max-width: 100%; overflow-x: auto; white-space: nowrap; scrollbar-width: none; font-size: .85rem; color: var(--ink); }
.ok { display: inline-flex; align-items: center; gap: .4rem; color: var(--primary-dark); font-weight: 500; font-size: .92rem; }
.ok svg { width: 1rem; height: 1rem; flex: none; }
.op-name { font-family: var(--mono); font-weight: 600; font-size: .9rem; }
.op-sum { color: var(--muted); font-size: .9rem; }
.params { display: flex; flex-wrap: wrap; gap: .3rem; margin-top: .45rem; }
.params code { padding: .05rem .4rem; background: #f4f4f5; border-radius: var(--r); font-size: .8rem; }
.shot .ev { grid-template-columns: 44px minmax(0, 1fr); padding-block: .5rem; }
@media (min-width: 640px) { .shot .ev { grid-template-columns: 44px minmax(0, 1fr) auto; } }
.shot-head + .ev { border-top: 0; padding-top: 0; }
.shot .ev img { width: 44px; height: 44px; align-self: center; }
.shot .ev-t { font-size: .95rem; }
.shot .ev-m, .shot .ev-p { font-size: .85rem; }
.shot .more { font-size: .9rem; color: var(--muted); padding-top: .5rem; }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .step:not(:last-child)::before { animation: rail linear both; animation-timeline: view(); animation-range: entry 30% entry 100%; }
    .node svg { animation: node linear both; animation-timeline: view(); animation-range: entry 40% entry 90%; }
  }
}
@keyframes rail { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes node { from { scale: .8; opacity: .4; } to { scale: 1; opacity: 1; } }

/* Connect */
.split { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem 3.5rem; }
@media (min-width: 1024px) { .split { grid-template-columns: minmax(0, 4fr) minmax(0, 7fr); } }
.intro p { margin: .75rem 0 0; }
.urlbox { display: flex; margin-top: 1.25rem; border: 1px solid var(--primary-line); border-radius: var(--r); overflow: hidden; min-width: 0; }
.urlbox code { flex: 1; min-width: 0; padding: .6rem .8rem; white-space: nowrap; overflow-x: auto; scrollbar-width: thin; }
.urlbox button { flex: none; border: 0; background: var(--primary); color: #fff; font: 500 .95rem var(--body); padding: 0 1rem; cursor: pointer; }
.urlbox button:hover { background: var(--primary-dark); }
.tabs { display: flex; flex-wrap: wrap; gap: .1rem; box-shadow: inset 0 -1px 0 var(--line); }
.tabs button { flex: none; background: none; border: 0; border-bottom: 2px solid transparent; padding: .55rem .6rem; font: 500 .95rem var(--body); color: var(--muted); cursor: pointer; }
.tabs button:hover { color: var(--ink); }
.tabs button[aria-selected="true"] { color: var(--primary); border-bottom-color: var(--primary); }
.fast { margin: .35rem 0 0; }
.cmd { margin-top: .75rem; }
.next { margin: 1.75rem 0 .35rem; }
.pane { padding-top: 1.1rem; }
.pane ol { margin: 0; padding-left: 1.3rem; display: grid; grid-template-columns: minmax(0, 1fr); gap: .6rem; }
.pane p { margin: 0 0 .7rem; }
.pane .hint { margin: .85rem 0 0; color: var(--muted); font-size: .92rem; }
.help { margin: 1.75rem 0 0; padding-top: 1rem; border-top: 1px solid var(--line); color: var(--muted); font-size: .92rem; }

/* Control */
.three { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem 3rem; margin-top: 2rem; }
@media (min-width: 760px) { .three { grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); } }
.three > div { text-align: center; }
.three svg { height: 72px; width: auto; display: block; margin: 0 auto .75rem; color: var(--primary); }
.three p { margin: .4rem auto 0; max-width: 21rem; text-wrap: pretty; }
.note { max-width: 44rem; margin: 2.25rem auto 0; text-align: center; color: var(--muted); font-size: .92rem; text-wrap: balance; }

/* Developers */
.devs { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem 3.5rem; margin-top: 1.5rem; }
@media (min-width: 900px) { .devs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.devs p { margin: .4rem 0 0; }
.devs .row { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .9rem; }

footer { background: var(--foot); color: #fff; padding-block: 1.75rem; }
.foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
.foot svg { height: 22px; width: auto; display: block; }
.foot nav { display: flex; flex-wrap: wrap; gap: .5rem 1.25rem; }
.foot a { color: #fff; font-size: .95rem; }
`;

const SCRIPT = `
document.querySelectorAll('[role="tablist"]').forEach((list) => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const select = (tab) => tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });
});

document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', () => {
  const el = document.getElementById(btn.dataset.copy);
  const pick = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  const done = () => { clearTimeout(btn.timer); btn.textContent = btn.dataset.copied; btn.timer = setTimeout(() => { btn.textContent = btn.dataset.label; }, 1600); };
  if (navigator.clipboard) navigator.clipboard.writeText(el.textContent).then(done, pick); else pick();
}));

const language = document.querySelector('.lang');
document.addEventListener('click', (e) => { if (!language.contains(e.target)) language.open = false; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && language.open) { language.open = false; language.querySelector('summary').focus(); } });
`;

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

/**
 * The language to serve: an explicit `?lang=` when it names one we have, else
 * what the browser's Accept-Language negotiated, else English.
 *
 * @param {unknown} requested - the `lang` query parameter, as sent.
 * @param {string|false} negotiated - `req.acceptsLanguages(...LOCALES)`.
 * @returns {string} one of LOCALES.
 */
export function pickLocale(requested, negotiated) {
  if (typeof requested === 'string' && LOCALES.includes(requested)) {
    return requested;
  }
  return negotiated || 'en';
}

/**
 * Render the landing page.
 *
 * @param {object} options
 * @param {string} options.resourceUrl - the MCP endpoint / OAuth resource (they
 *   coincide: the URL a client is configured with is bound as the token audience).
 * @param {string} [options.locale] - one of LOCALES (default: English).
 * @param {boolean} [options.isolated] - whether this deployment's sandbox bounds
 *   both egress and the filesystem. The page only promises isolation it has,
 *   like the `execute` tool description (see sandboxFacts).
 * @param {Date} [options.now] - the moment of the request, whose week the
 *   example code searches (default: now).
 * @returns {string} a complete HTML document.
 */
export function landingPage({
  resourceUrl,
  locale = 'en',
  isolated = false,
  now = new Date(),
}) {
  const messages = MESSAGES[locale];
  // A language Crowdin has not finished falls back on the source, key by key.
  const t = (key, values = {}) =>
    (messages[key] ?? en[key]).replace(
      /\{(\w+)\}/g,
      (match, name) => values[name] ?? match,
    );
  const attr = (key) => escapeHtml(t(key));

  const endpoint = escapeHtml(resourceUrl);
  const { origin } = new URL(resourceUrl);
  const metadata = escapeHtml(
    getOAuthProtectedResourceMetadataUrl(new URL(resourceUrl)),
  );
  // One-click "install" deep links. Cursor takes a base64 config, VS Code a
  // URL-encoded one; both carry just the remote endpoint (every target runs the
  // OAuth flow itself on first connect).
  const cursorInstall = escapeHtml(
    `cursor://anysphere.cursor-deeplink/mcp/install?name=openagenda&config=${Buffer.from(
      JSON.stringify({ url: resourceUrl }),
    ).toString('base64')}`,
  );
  const vscodeInstall = escapeHtml(
    `https://vscode.dev/redirect/mcp/install?name=openagenda&config=${encodeURIComponent(
      JSON.stringify({ type: 'http', url: resourceUrl }),
    )}`,
  );

  const copyButton = (target, className = '') =>
    `<button${className ? ` class="${className}"` : ''} type="button" data-copy="${target}" data-label="${attr('copy')}" data-copied="${attr('copied')}">${t('copy')}</button>`;

  const toolTab = (id, label, selected = false) =>
    `<button type="button" role="tab" aria-selected="${selected}" aria-controls="tool-${id}" id="tool-tab-${id}"${selected ? '' : ' tabindex="-1"'}>${label}</button>`;

  const exampleTab = (id, selected = false) =>
    `<button class="btn btn-outline" type="button" role="tab" aria-selected="${selected}" aria-controls="example-${id}" id="example-tab-${id}"${selected ? '' : ' tabindex="-1"'}>${t(`examples.${id}`)}</button>`;

  const points = (id) =>
    `<ul class="checks">${[1, 2, 3].map((n) => `<li>${t(`${id}.point${n}`)}</li>`).join('')}</ul>`;

  const code = (value) => `<code>${escapeHtml(value)}</code>`;
  const eventRow = (event, i) =>
    `<div class="ev"><img src="https://img.openagenda.com/u/128x128/smart/main/${event.image}.full.image.jpg" width="64" height="64" loading="lazy" alt=""><div class="ev-t">${escapeHtml(event.title)}</div><div class="ev-m">${t(`find.event${i + 1}.when`)}. ${escapeHtml(event.where)}</div><div class="ev-p">${escapeHtml(event.price)}</div></div>`;
  // A step of "how it works": its number is drawn, the list says it.
  const step = (n, id, shot, { kind = '', more = '' } = {}) =>
    `<li class="step"><div class="node" aria-hidden="true">${stepRing}<span>${n}</span></div><div class="step-text"><h3>${t(`how.${id}.title`)}</h3><p>${t(`how.${id}.text`)}</p>${more}</div><div class="shot${kind ? ` shot-${kind}` : ''}">${shot}</div></li>`;
  const colored = (value, lang, id) =>
    `<code${id ? ` id="${id}"` : ''}>${highlight(value, { lang })}</code>`;
  // Highlighted once, shown twice: in the "find" example and in step 4.
  const exampleCode = colored(findCode(parisWeek(now)), 'javascript');

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t('meta.title')}</title>
<meta name="description" content="${attr('meta.description')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="OpenAgenda">
<meta property="og:title" content="${attr('meta.title')}">
<meta property="og:description" content="${attr('meta.description')}">
<meta property="og:url" content="${escapeHtml(origin)}/?lang=${locale}">
<meta property="og:locale" content="${locale}">
${LOCALES.filter((l) => l !== locale)
    .map((l) => `<meta property="og:locale:alternate" content="${l}">`)
    .join('\n')}
<meta property="og:image" content="${escapeHtml(origin)}/assets/og.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr('sketch.alt')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${escapeHtml(origin)}/?lang=${locale}">
${LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${escapeHtml(origin)}/?lang=${l}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${escapeHtml(origin)}/">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preload" href="/assets/fonts/ubuntu-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/noto-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>${STYLES}</style>
<noscript><style>[role="tabpanel"][hidden] { display: block; margin-top: 1rem; } [role="tablist"], [data-copy] { display: none; }</style></noscript>
</head>
<body>
<header class="hero">
  <div class="wrap">
    <div class="nav">
      <a class="brand" href="https://openagenda.com" aria-label="OpenAgenda">${logo}</a>
      <div class="nav-links">
        <details class="lang">
          <summary>${langIcon}<span class="sr">${t('nav.language')} : </span><span class="lang-name">${LANGUAGE_NAMES[locale]}</span>${chevronIcon}</summary>
          <ul>
            ${LOCALES.map((l) => `<li><a href="/?lang=${l}" hreflang="${l}" lang="${l}"${l === locale ? ' aria-current="true"' : ''}>${LANGUAGE_NAMES[l]}</a></li>`).join('\n            ')}
          </ul>
        </details>
        <a class="pill" href="${SOURCE_URL}" aria-label="${attr('nav.source')}">${githubIcon}<span>${t('nav.source')}</span></a>
      </div>
    </div>
    <div class="hero-in">
      <h1>${t('hero.title')}</h1>
      <p class="lede">${t('hero.lede')}</p>
      ${sketch(attr('sketch.alt'))}
      <div class="cta">
        <a class="btn btn-solid" href="#connect">${t('hero.connect')}</a>
        <a class="btn btn-outline" href="#examples">${t('hero.examples')}</a>
      </div>
      <p class="addr"><span>${t('hero.address')}</span> <code id="endpoint">${endpoint}</code> ${copyButton('endpoint', 'linkbtn')}</p>
    </div>
  </div>
</header>

<main>
  <section class="band band-warm" id="examples">
    <div class="wrap">
      <h2 class="center">${t('examples.title')}</h2>
      <div class="seg" role="tablist" aria-label="${attr('examples.label')}">
        ${exampleTab('find', true)}
        ${exampleTab('edit')}
        ${exampleTab('moderate')}
      </div>

      <div class="convo" id="example-find" role="tabpanel" aria-labelledby="example-tab-find">
        <p class="ask">${t('find.ask')}</p>
        <p class="says">${t('find.says')}</p>
        ${FIND_EVENTS.map(eventRow).join('\n        ')}
        <p class="more">${t('find.more')}</p>
        <details><summary>${t('find.code')}</summary><pre>${exampleCode}</pre></details>
      </div>

      <div class="convo" id="example-edit" role="tabpanel" aria-labelledby="example-tab-edit" hidden>
        <p class="ask">${t('edit.ask')}</p>
        <p class="says">${t('edit.says')}</p>
        ${points('edit')}
      </div>

      <div class="convo" id="example-moderate" role="tabpanel" aria-labelledby="example-tab-moderate" hidden>
        <p class="ask">${t('moderate.ask')}</p>
        <p class="says">${t('moderate.says')}</p>
        ${points('moderate')}
      </div>
    </div>
  </section>

  <section class="band band-cool" id="how">
    <div class="wrap">
      <h2 class="center">${t('how.title')}</h2>
      <p class="sub center">${t('how.lede')}</p>
      <ol class="flow">
        ${step(1, 'connect', `<div class="linked"><code>${escapeHtml(resourceUrl.replace(/^https?:\/\//, ''))}</code><span class="ok">${checkIcon}${t('how.connect.status')}</span></div>`)}
        ${step(2, 'ask', `<p class="ask">${t('find.ask')}</p>`)}
        ${step(
    3,
    'search',
    `<div class="shot-head"><code class="tool">search_docs</code></div><div class="op"><div class="op-name">agendas.events.list</div><div class="op-sum">${t('how.search.summary')}</div><div class="params">${['search', 'timings', 'sort'].map(code).join('')}</div></div>`,
    {
      more: `<p class="steplink"><a href="${API_DOCS_URL}">${t('how.search.docs')}</a></p>`,
    },
  )}
        ${step(4, 'write', `<pre>${exampleCode}</pre>`, { kind: 'code' })}
        ${step(5, 'run', `<div class="shot-head"><code class="tool">execute</code></div>${FIND_EVENTS.slice(0, 2).map(eventRow).join('')}<p class="more">${t('how.run.more')}</p>`)}
      </ol>
    </div>
  </section>

  <section class="band" id="connect">
    <div class="wrap split">
      <div class="intro">
        <h2>${t('connect.title')}</h2>
        <p>${t('connect.lede')}</p>
        <div class="urlbox"><code id="endpoint2">${endpoint}</code>${copyButton('endpoint2')}</div>
      </div>
      <div>
        <h3>${t('connect.fast.title')}</h3>
        <p class="fast">${t('connect.fast.text')}</p>
        <div class="urlbox cmd"><code id="addmcp">npx add-mcp ${endpoint}</code>${copyButton('addmcp')}</div>
        <h3 class="next">${t('connect.tools.title')}</h3>
        <div class="tabs" role="tablist" aria-label="${attr('connect.tools.label')}">
          ${toolTab('claude', 'Claude', true)}
          ${toolTab('chatgpt', 'ChatGPT')}
          ${toolTab('claudecode', 'Claude Code')}
          ${toolTab('cursor', 'Cursor')}
          ${toolTab('vscode', 'VS Code')}
          ${toolTab('other', t('connect.other'))}
        </div>
        <div class="pane" id="tool-claude" role="tabpanel" aria-labelledby="tool-tab-claude"><ol>
          <li>${t('claude.step1')}</li>
          <li>${t('step.paste')}</li>
          <li>${t('claude.step3')}</li>
        </ol></div>
        <div class="pane" id="tool-chatgpt" role="tabpanel" aria-labelledby="tool-tab-chatgpt" hidden><ol>
          <li>${t('chatgpt.step1')}</li>
          <li>${t('chatgpt.step2')}</li>
          <li>${t('step.signin')}</li>
        </ol><p class="hint">${t('chatgpt.hint')}</p></div>
        <div class="pane" id="tool-claudecode" role="tabpanel" aria-labelledby="tool-tab-claudecode" hidden><ol>
          <li>${t('claudecode.step1')}<div class="snippet"><pre><code id="claudecode-cmd">claude mcp add --transport http openagenda ${endpoint}</code></pre>${copyButton('claudecode-cmd')}</div></li>
          <li>${t('claudecode.step2', { command: code('/mcp') })}</li>
        </ol></div>
        <div class="pane" id="tool-cursor" role="tabpanel" aria-labelledby="tool-tab-cursor" hidden>
          <p><a class="btn btn-solid btn-sm" href="${cursorInstall}">${t('cursor.button')}</a></p>
          <p>${t('cursor.or', { path: code('~/.cursor/mcp.json') })}</p>
          <div class="snippet"><pre>${colored(
    `{
  "mcpServers": {
    "openagenda": { "url": "${resourceUrl}" }
  }
}`,
    'json',
    'cursor-config',
  )}</pre>${copyButton('cursor-config')}</div>
        </div>
        <div class="pane" id="tool-vscode" role="tabpanel" aria-labelledby="tool-tab-vscode" hidden>
          <p><a class="btn btn-solid btn-sm" href="${vscodeInstall}">${t('vscode.button')}</a></p>
          <p>${t('vscode.or')}</p>
          <div class="snippet"><pre><code id="vscode-cmd">code --add-mcp '{"name":"openagenda","type":"http","url":"${endpoint}"}'</code></pre>${copyButton('vscode-cmd')}</div>
        </div>
        <div class="pane" id="tool-other" role="tabpanel" aria-labelledby="tool-tab-other" hidden><p>${t('other.text', { metadata })}</p></div>
        <p class="help">${t('connect.help', { email: `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>` })}</p>
      </div>
    </div>
  </section>

  <section class="band band-cool">
    <div class="wrap">
      <h2 class="center">${t('control.title')}</h2>
      <div class="three">
        <div>${personIcon}<h3>${t('control.rights.title')}</h3><p>${t('control.rights.text')}</p></div>
        ${isolated ? `<div>${shieldIcon}<h3>${t('control.isolated.title')}</h3><p>${t('control.isolated.text')}</p></div>` : ''}
        <div>${globeIcon}<h3>${t('control.open.title')}</h3><p>${t('control.open.text')}</p></div>
      </div>
      <p class="note">${t('control.privacy')}</p>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <h2>${t('devs.title')}</h2>
      <div class="devs">
        <div>
          <h3>${t('devs.run.title')}</h3>
          <p>${t('devs.run.text')}</p>
          <pre><code>OA_API_KEY=… npx -y @openagenda/mcp</code></pre>
          <div class="row"><a class="btn btn-outline btn-sm" href="${NPM_URL}">${t('devs.run.npm')}</a><a class="btn btn-outline btn-sm" href="${MCPB_URL}">${t('devs.run.bundle')}</a></div>
        </div>
        <div>
          <h3>${t('devs.build.title')}</h3>
          <p>${t('devs.build.text')}</p>
          <pre>${colored(SDK_CODE, 'javascript')}</pre>
          <p>${t('devs.build.keys', { pk: code('oa_pk_…'), sk: code('oa_sk_…') })}</p>
          <div class="row"><a class="btn btn-outline btn-sm" href="${API_DOCS_URL}">${t('devs.build.docs')}</a><a class="btn btn-outline btn-sm" href="${SDK_URL}">${t('devs.build.sdk')}</a></div>
        </div>
      </div>
    </div>
  </section>
</main>

<footer><div class="wrap foot"><a href="https://openagenda.com" aria-label="OpenAgenda">${whiteLogo}</a><nav><a href="https://openagenda.com">openagenda.com</a><a href="${SOURCE_URL}">${t('nav.source')}</a><a href="${NPM_URL}">npm</a><a href="${HELP_URL}">${t('nav.help')}</a><a href="${PRIVACY_URL}" hreflang="fr">${t('nav.privacy')}</a></nav></div></footer>
<script>${SCRIPT}</script>
</body>
</html>`;
}
