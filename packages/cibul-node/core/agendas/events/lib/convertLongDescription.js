import logs from '@openagenda/logs';
import { fromMarkdownToHTML } from '@openagenda/md';
import { produce } from 'immer';

const log = logs('core/agendas/events/convertLongDescription');

export const conversions = ['HTML', 'HTMLWithEmbeds'];

// Returns the HTML for one markdown value. The expensive markdown→HTML step is
// skipped when a pre-computed HTML variant was stored in the index at indexing
// time (see docs/design/lag-loop-stocker-html-dans-index.md). Events not yet
// reindexed have no stored HTML → fall back to converting on the fly (zero
// regression during rollout). The on-the-fly call must stay identical to the one
// replayed at index time in event-search's formatEvent.js (default options).
function convert(params, links = [], md = '', storedHtml = undefined) {
  const { services, conversion, includeEmbedScripts, cspNonce } = params;
  const { oembed } = services;

  const HTML = typeof storedHtml === 'string' ? storedHtml : fromMarkdownToHTML(md);

  if (!links || conversion !== 'HTMLWithEmbeds') {
    return HTML;
  }

  // The embeds variant cannot be frozen in the index (injectEmbeds stamps a
  // per-request cspNonce), so it is always rebuilt at read time — but starting
  // from the stored HTML when available, which still removes the markdown parse.
  const HTMLWithEmbeds = oembed.injectEmbeds(HTML, links, {
    includeEmbedScripts,
    cspNonce,
  });

  return HTMLWithEmbeds;
}

export default function convertField(
  { links, longDescription, longDescriptionHtml },
  params,
) {
  log('convertField to format %s', params.conversion);
  if (typeof longDescription === 'string') {
    return convert(
      params,
      links,
      longDescription,
      typeof longDescriptionHtml === 'string' ? longDescriptionHtml : undefined,
    );
  }

  return Object.keys(longDescription).reduce(
    (converted, lang) =>
      Object.assign(converted, {
        [lang]: convert(params, links, longDescription[lang], longDescriptionHtml?.[lang]),
      }),
    {},
  );
}

export function shouldConvert(longDescription, conversion) {
  if (!conversions.includes(conversion)) {
    return false;
  }

  return !!longDescription;
}

export function load({
  services,
  conversion,
  includeEmbedScripts,
  cspNonce,
  includeLongDescriptionHtml = false,
}) {
  return (event) =>
    produce(event, (draft) => {
      if (!shouldConvert(event.longDescription, conversion)) {
        return;
      }

      const converted = convertField(event, {
        services,
        conversion,
        includeEmbedScripts,
        cspNonce,
      });

      if (includeLongDescriptionHtml) {
        // Additive: keep the markdown in longDescription and expose the HTML
        // variant in a dedicated field (markdown + HTML in a single call).
        draft.longDescriptionHtml = converted;
      } else {
        // Legacy behavior: replace longDescription with its HTML conversion.
        draft.longDescription = converted;
      }
    });
}
