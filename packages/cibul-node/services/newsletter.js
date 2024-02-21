'use strict';

const Newsletter = require('@openagenda/newsletter');

module.exports.init = config => {
  return Newsletter({
    mailjet: config.mailjet,
    logger: config.getLogConfig('oa', 'newsletter', false),
  });
};
