'use strict';

const listUserAgendas = require('./listUserAgendas');
const canEditEvent = require('./canEditEvent');
const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

module.exports = core => {
  return Object.assign(identifier => ({
    agendas: Object.assign(agendaUid => ({
      getAuthorizations: getUserAuthorizationsOnAgenda.bind(null, core, identifier, agendaUid)
    }), {
      list: listUserAgendas.bind(null, core.services, identifier)
    }),
    generateToken: core.services.accessTokens.generateToken.bind(null, identifier),
    canEditEvent: canEditEvent.bind(null, core, identifier)
  }), {
    get: {
      byAccessToken: (token, nonce) => core.services.accessTokens.getUser(token, nonce),
      byPublicKey: key => core.services.accessTokens.getUserFromKey(key)
    }
  })
}
