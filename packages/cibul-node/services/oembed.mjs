import _ from 'lodash';
import OEmbed from '@openagenda/oembed';

export function init(config) {
  return new OEmbed({
    iframely: {
      key: _.get(config, 'oembed.key'),
    },
    filters: _.get(config, 'oembed.platforms'),
    logger: config.getLogConfig('svc', 'oembed'),
  });
}
