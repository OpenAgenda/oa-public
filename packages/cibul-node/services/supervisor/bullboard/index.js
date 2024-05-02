'use strict';

// const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const contentSecurityPolicy = require('../../../lib/contentSecurityPolicy');
const ExpressAdapter = require('./ExpressAdapter');

const csp = contentSecurityPolicy({
  ...contentSecurityPolicy.defaultDirectives,
  baseUri: ["'self'"],
  styleSrc: [
    ...contentSecurityPolicy.defaultDirectives.styleSrc,
    'https://fonts.googleapis.com',
  ],
  fontSrc: [
    ...contentSecurityPolicy.defaultDirectives.fontSrc,
    'https://fonts.gstatic.com',
  ],
  scriptSrc: ["'self'"],
});

module.exports.plugApp = (app, base = '/bullboard') => {
  const { bull: { Queue } } = app.services;

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(base);

  createBullBoard({
    queues: [
      new BullMQAdapter(new Queue('memberMessages', { prefix: '{memberMessages}' })),
      new BullMQAdapter(new Queue('addActivity', { prefix: '{addActivity}' })),
      new BullMQAdapter(new Queue('prepareSummary', { prefix: '{prepareSummary}' })),
    ],
    serverAdapter,
  });

  app.use(
    base,
    csp,
    serverAdapter.getRouter(),
  );
};
