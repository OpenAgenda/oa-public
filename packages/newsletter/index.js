'use strict';

const _ = require('lodash');
const Mailjet = require('node-mailjet');
const logger = require('@openagenda/logs');

module.exports = c => {
  const config = _.merge({
    logger: false,
    mailjet: {
      apiKey: 'CanardLaKey',
      apiSecret: 'FranceToner',
      contactsListId: 'JM-France',
    },
  }, c);

  if (c.logger) logger.setModuleConfig(c.logger);

  const mailjet = new Mailjet({
    apiKey: config.mailjet.apiKey,
    apiSecret: config.mailjet.apiSecret,
  });

  return {
    async addSubscriber(email) {
      return mailjet
        .post('contactslist', { version: 'v3' })
        .id(config.mailjet.contactsListId)
        .action('managecontact')
        .request({
          Action: 'addnoforce',
          Email: email,
        });
    },
  };
};
