'use strict';

// const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const ExpressAdapter = require('./ExpressAdapter');

module.exports.plugApp = (app, base = '/bullboard') => {
  const { bull: { Queue } } = app.services;

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(base);

  createBullBoard({
    queues: [
      new BullMQAdapter(new Queue('memberMessages', { prefix: '{memberMessages}' })),
    ],
    serverAdapter,
  });

  app.use(base, serverAdapter.getRouter());
};
