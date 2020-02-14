'use strict';

const listUserAgendas = require('./listUserAgendas');

module.exports = services => {
  return Object.assign(identifier => ({
    agendas: {
      list: listUserAgendas.bind(null, services, identifier)
    },
    generateToken: services.accessTokens.generateToken.bind(null, identifier)
  }), {
    get: {
      byAccessToken: (token, nonce) => services.accessTokens.getUser(token, nonce),
      byPublicKey: key => services.accessTokens.getUserFromKey(key)
    }
  })
}
