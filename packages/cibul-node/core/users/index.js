'use strict';

const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

const listUserAgendas = require('./listUserAgendas');
const canEditEvent = require('./canEditEvent');
const getEventUserContext = require('./getEventUserContext');
const getAgendaUserContext = require('./getAgendaUserContext');
const get = require('./get');
const remove = require('./remove');
const generateToken = require('./generateToken');

module.exports = core => Object.assign(identifier => ({
  remove: remove(core, identifier),
  agendas: Object.assign(agendaUid => ({
    getAuthorizations: getUserAuthorizationsOnAgenda.bind(null, core, identifier, agendaUid),
    getContext: (options = {}) => getAgendaUserContext(core, identifier, agendaUid, options),
    events: eventOrUid => ({
      getContext: (options = {}) => getEventUserContext(core, identifier, agendaUid, eventOrUid, options)
    })
  }), {
    list: listUserAgendas(core, identifier)
  }),
  generateToken: generateToken.bind(null, core, identifier),
  canEditEvent: canEditEvent.bind(null, core, identifier)
}), {
  get: Object.assign(get(core), {
    byAccessToken: (token, nonce) => core.services.accessTokens.getUser(token, nonce),
    byPublicKey: key => core.services.accessTokens.getUserFromKey(key)
  })
});
