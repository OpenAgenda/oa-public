import logs from '@openagenda/logs';
import { fromMarkdownToHTML } from '@openagenda/md';
import { produce } from 'immer';

const log = logs('core/agendas/events/convertLongDescription');

export const conversions = ['HTML', 'HTMLWithEmbeds'];

function convert(params, links = [], md = '') {
  const { services, conversion, includeEmbedScripts, cspNonce } = params;
  const { oembed } = services;

  const HTML = fromMarkdownToHTML(md);

  if (!links || conversion !== 'HTMLWithEmbeds') {
    return HTML;
  }

  const HTMLWithEmbeds = oembed.injectEmbeds(HTML, links, {
    includeEmbedScripts,
    cspNonce,
  });

  return HTMLWithEmbeds;
}

export default function convertField({ links, longDescription }, params) {
  log('convertField to format %s', params.conversion);
  if (typeof longDescription === 'string') {
    return convert(params, links, longDescription);
  }

  return Object.keys(longDescription).reduce(
    (converted, lang) =>
      Object.assign(converted, {
        [lang]: convert(params, links, longDescription[lang]),
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

export function load({ services, conversion, includeEmbedScripts, cspNonce }) {
  return (event) =>
    produce(event, (draft) => {
      if (!shouldConvert(event.longDescription, conversion)) {
        return;
      }

      draft.longDescription = convertField(event, {
        services,
        conversion,
        includeEmbedScripts,
        cspNonce,
      });
    });
}
