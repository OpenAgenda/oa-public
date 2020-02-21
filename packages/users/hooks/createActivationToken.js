'use strict';

module.exports = function createActivationToken() {
  return async context => {
    if (context.result && !context.result.isActivated) {
      const tokensSvc = context.self.config.getTokensService();

      context.params.activationToken = await tokensSvc.create(
        {
          type: 'activateAccount',
          userId: context.result.id,
          email: context.result.email
        },
        {
          optionals: context.params.tokenOptionals,
          user: context.result
        }
      );
    }
  };
};
