// const { ExpressAdapter } = require('@bull-board/express');
import { createBullBoard } from '@bull-board/api';

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import * as contentSecurityPolicy from '../../../lib/contentSecurityPolicy.js';
import cmn from '../../../lib/commons-app.js';
import ExpressAdapter from './ExpressAdapter.js';

const csp = contentSecurityPolicy.default({
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

export function plugApp(app, base = '/bullboard') {
  const {
    bull: { Queue },
    sessions,
    users,
  } = app.services;

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(base);

  createBullBoard({
    queues: [
      new BullMQAdapter(new Queue('aggregators', { prefix: '{aggregators}' })),
      new BullMQAdapter(new Queue('addActivity', { prefix: '{addActivity}' })),
      new BullMQAdapter(
        new Queue('prepareSummary', { prefix: '{prepareSummary}' }),
      ),
      new BullMQAdapter(
        new Queue('memberMessages', { prefix: '{memberMessages}' }),
      ),
    ],
    serverAdapter,
  });

  app.use(
    base,
    sessions.mw.ifUnlogged(cmn.redirectToSignin),
    users.mw.allowSuperAdmin(),
    csp,
    serverAdapter.getRouter(),
  );
}
