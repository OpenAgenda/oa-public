'use strict';

const express = require('express');
const ih = require('immutability-helper');
const agendaFiles = require('./lib/agendaFiles');
const defaultState = require('./defaultState');

module.exports = function App({ queue, s3 }) {
  const app = express();

  app.use(express.urlencoded({ extended: true }));

  app.param('agendaUid', (req, res, next, uid) => {
    req.agendaFiles = agendaFiles({
      s3,
      bucket: s3.bucket,
      uid,
    });

    next();
  });

  app.get('/:agendaUid/state', async (req, res) => {
    res.json(await req.agendaFiles.getJSON('state.json', defaultState));
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
};
