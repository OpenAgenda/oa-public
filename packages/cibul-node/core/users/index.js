'use strict'

module.exports = services => {

  return {
    get: {
      byAccessToken: (token, nonce) => services.accessTokens.getUser(token, nonce),
      byPublicKey: key => services.accessTokens.getUserFromKey(key)
    },
    generateToken: secretKey => services.accessTokens.generateToken(secretKey)
  }
}
