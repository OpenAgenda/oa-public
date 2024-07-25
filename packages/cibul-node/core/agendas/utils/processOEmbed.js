import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('core/utils/processOEmbed');

export default (
  oembed,
  text,
  {
    current = [],
    includeEmbedlessLinks = true,
    filterInvalidLinks = true,
    lazy = true,
  },
) => {
  if (!oembed) {
    log('oembed service is not initialized');
    return [];
  }

  log('processing oembed');
  if (!text) {
    return [];
  }

  return oembed.fromMarkdown(Object.values(text).join('\n'), {
    current, includeEmbedlessLinks, filterInvalidLinks, lazy,
  }).then(links => links.map(link => _.set(link, 'type', 'oembed')));
};
