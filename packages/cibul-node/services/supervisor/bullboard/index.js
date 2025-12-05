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
      new BullMQAdapter(new Queue('aggregators', { prefix: '{aggregators}' }), {
        displayName: 'Agrégations',
      }),
      new BullMQAdapter(new Queue('locations', { prefix: '{locations}' }), {
        displayName: 'Répercution des modifs de lieux',
      }),
      new BullMQAdapter(new Queue('core', { prefix: '{core}' }), {
        displayName: 'Core',
      }),
      new BullMQAdapter(new Queue('inboxesSync', { prefix: '{inboxesSync}' }), {
        displayName: 'Sync messageries',
      }),
      new BullMQAdapter(new Queue('addActivity', { prefix: '{addActivity}' }), {
        prefix: 'Activités.',
        displayName: "Ajouts d'activités",
        delimiter: '.',
      }),
      new BullMQAdapter(
        new Queue('prepareSummary', { prefix: '{prepareSummary}' }),
        {
          prefix: 'Activités.',
          displayName: 'Résumés de notifications',
          delimiter: '.',
        },
      ),
      new BullMQAdapter(
        new Queue('memberMessages', { prefix: '{memberMessages}' }),
        {
          prefix: 'Membres.',
          displayName: 'Messages aux membres',
          delimiter: '.',
        },
      ),
      new BullMQAdapter(new Queue('members', { prefix: '{members}' }), {
        prefix: 'Membres.',
        displayName: 'Invitations de membres',
        delimiter: '.',
      }),
      new BullMQAdapter(new Queue('eventSearch', { prefix: '{eventSearch}' }), {
        prefix: 'eventSearch.',
        displayName: 'Synchronisation des événements',
        delimiter: '.',
      }),
      new BullMQAdapter(
        new Queue('eventSearch-rebuild', { prefix: '{eventSearch-rebuild}' }),
        {
          prefix: 'eventSearch.',
          displayName: 'Rebuild index',
          delimiter: '.',
        },
      ),
      new BullMQAdapter(new Queue('mails', { prefix: '{mails}' }), {
        displayName: 'Emails',
      }),
      new BullMQAdapter(new Queue('users', { prefix: '{users}' }), {
        displayName: 'Anonymisation des utilisateurs',
      }),
      new BullMQAdapter(new Queue('agendaDocx', { prefix: '{agendaDocx}' }), {
        displayName: 'Docx agendas',
      }),
      new BullMQAdapter(
        new Queue('behavioralEmails', { prefix: '{behavioralEmails}' }),
        {
          displayName: 'Emails comportementaux',
        },
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
