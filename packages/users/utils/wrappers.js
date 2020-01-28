'use strict';

const toBeforeHook = hook => async (context, next) => {
  await hook(context);
  await next();
};

const toAfterHook = hook => async (context, next) => {
  await next();
  await hook(context);
};

const beforeWrapper = (...hooks) => [
  (context, next) => {
    context.params = context.params || {};
    context.type = 'before';
    return next();
  },
  ...hooks.map(toBeforeHook)
];

const afterWrapper = (...hooks) => [
  ...hooks.reverse().map(toAfterHook),
  (context, next) => {
    context.type = 'after';
    return next();
  }
];

module.exports = {
  toBeforeHook,
  toAfterHook,
  beforeWrapper,
  afterWrapper
};
