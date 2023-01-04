'use strict';

module.exports = function onRemove({ queue }) {
  return async ctx => {
    const user = ctx.params.before;

    if (!user) {
      return ctx;
    }

    queue('anonymizeDeletedUser', { user });
  };
};
