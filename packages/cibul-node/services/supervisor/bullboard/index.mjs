// const { ExpressAdapter } = require('@bull-board/express');
import { createBullBoard } from '@bull-board/api';

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import contentSecurityPolicy from '../../../lib/contentSecurityPolicy.js';
import ExpressAdapter from './ExpressAdapter.js';

const csp = contentSecurityPolicy({
  ...contentSecurityPolicy.defaultDirectives,
  baseUri: ['\'self\''],
  styleSrc: [
    ...contentSecurityPolicy.defaultDirectives.styleSrc,
    'https://fonts.googleapis.com',
  ],
  fontSrc: [
    ...contentSecurityPolicy.defaultDirectives.fontSrc,
    'https://fonts.gstatic.com',
  ],
  scriptSrc: ['\'self\''],
});

export function plugApp(app, base = '/bullboard') {
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
}
