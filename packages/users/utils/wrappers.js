'use strict';

function firstHook(context, next) {
  context.type = 'before';
  return next();
}

function lastHook(context, next) {
  context.type = 'after';
  return next();
}

function toBeforeHook(hook) {
  return async (context, next) => {
    await hook(context);
    await next();
  };
}

function toAfterHook(hook) {
  return async (context, next) => {
    await next();
    await hook(context);
  };
}

function beforeWrapper(...hooks) {
  return [firstHook, ...hooks.map(toBeforeHook)];
}

function afterWrapper(...hooks) {
  return [...hooks.reverse().map(toAfterHook), lastHook];
}

function wrap({ async = [], before = [], after = [] } = {}) {
  return [
    ...[].concat(async),
    firstHook,
    ...[].concat(before).map(toBeforeHook),
    ...[].concat(after).reverse().map(toAfterHook),
    lastHook,
  ];
}

module.exports = {
  wrap,
  beforeWrapper,
  afterWrapper,
  toBeforeHook,
  toAfterHook,
};
