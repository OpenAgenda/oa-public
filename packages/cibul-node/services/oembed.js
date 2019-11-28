"use strict";

const _ = require('lodash');

const OEmbed = require('@openagenda/oembed');

module.exports.init = config => new OEmbed({
  iframely: {
    key: _.get(config, 'oembed.key')
  },
  filters: _.get(config, 'oembed.platforms'),
  logger: config.getLogConfig('svc', 'oembed')
});
