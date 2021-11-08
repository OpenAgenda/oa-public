'use strict';

const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

const listUserAgendas = require('./listUserAgendas');
const canEditEvent = require('./canEditEvent');
const getEventUserContext = require('./getEventUserContext');
const get = require('./get');

module.exports = core => Object.assign(identifier => ({
  agendas: Object.assign(agendaUid => ({
    getAuthorizations: getUserAuthorizationsOnAgenda.bind(null, core, identifier, agendaUid),
    events: eventUid => ({
      getContext: (options = {}) => getEventUserContext(core, identifier, agendaUid, eventUid, options)
    })
  }), {
    list: listUserAgendas(core, identifier)
  }),
  generateToken: core.services.accessTokens.generateToken.bind(null, identifier),
  canEditEvent: canEditEvent.bind(null, core, identifier)
}), {
  get: Object.assign(get(core), {
    byAccessToken: (token, nonce) => core.services.accessTokens.getUser(token, nonce),
    byPublicKey: key => core.services.accessTokens.getUserFromKey(key)
  })
});
