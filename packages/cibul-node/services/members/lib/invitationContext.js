'use strict';

const _ = require('lodash');

module.exports = (invitation, agendaUid, defaultContext = null) => {
  const action = _.get(
    invitation,
    'data.actions',
    [],
  ).findLast(v => v.name === 'linkMember' && v.params[0].agendaUid === agendaUid);
  return _.get(action, 'params.1', defaultContext); // message is in there
};

module.exports.getLang = (invitation, defaultLang = 'fr') => {
  const context = module.exports(invitation);
  return _.get(context, 'lang', defaultLang);
};
