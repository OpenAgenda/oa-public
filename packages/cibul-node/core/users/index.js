'use strict';

const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

const listUserAgendas = require('./listUserAgendas');
const canEditEvent = require('./canEditEvent');
const getEventUserContext = require('./getEventUserContext');

module.exports = core => Object.assign(identifier => ({
  agendas: Object.assign(agendaUid => ({
    getAuthorizations: getUserAuthorizationsOnAgenda.bind(null, core, identifier, agendaUid),
    events: eventUid => ({
      getContext: () => getEventUserContext(core, identifier, agendaUid, eventUid)
    })
  }), {
    list: listUserAgendas(core, identifier)
  }),
  generateToken: core.services.accessTokens.generateToken.bind(null, identifier),
  canEditEvent: canEditEvent.bind(null, core, identifier)
}), {
  get: {
    byAccessToken: (token, nonce) => core.services.accessTokens.getUser(token, nonce),
    byPublicKey: key => core.services.accessTokens.getUserFromKey(key)
  }
});
