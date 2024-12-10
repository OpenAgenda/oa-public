import express from 'express';
import ih from 'immutability-helper';
import agendaFiles from './lib/agendaFiles.js';
import defaultState from './defaultState.js';

export default function App({ queue, s3, bucketPath }) {
  const app = express();

  app.use(express.urlencoded({ extended: true }));

  app.param('agendaUid', (req, res, next, uid) => {
    req.agendaFiles = agendaFiles({ s3, uid });

    next();
  });

  app.get('/:agendaUid/state', async (req, res) => {
    const state = await req.agendaFiles.getJSON('state.json', defaultState);

    if (state.file) {
      if (state.file.path?.startsWith('https://')) {
        const { pathname } = new URL(state.file.path);
        const normalizedPrefix = bucketPath.endsWith('/')
          ? bucketPath.slice(0, -1)
          : bucketPath;

        state.file.path = `${normalizedPrefix}${pathname}`;
      } else {
        state.file.path = `${bucketPath}${state.file.path}`;
      }
    }

    res.json(state);
  });

  app.post('/:agendaUid/queue', async (req, res) => {
    const state = await req.agendaFiles.getJSON('state.json', defaultState);

    const updatedState = ih(state, {
      queued: { $set: true },
      lastQueuedAt: { $set: JSON.stringify(new Date()) },
    });

    await req.agendaFiles.setJSON('state.json', updatedState);

    await queue('processGenerateRequest', {
      uid: req.params.agendaUid,
      templateName: req.query.templateName,
      from: req.query.from,
      to: req.query.to,
    });

    res.json(updatedState);
  });

  return app;
}
