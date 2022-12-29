const cors = require('cors');
const express = require('express');
const getFixtures = require('../fixtures');

const dev = express();
dev.use(express.urlencoded({ extended: true }));
dev.use(express.json());

dev.use(cors());

dev.get('/api/agendas/:agendaUid/settings/eventSchema', (req, res) => {
  const response = getFixtures(req.params.agendaUid).schema;
  res.json({
    ...response,
  });
});

dev.post('/api/agendas/:agendaUid/settings/eventSchema', (req, res) => {
  res.json({
    ...true,
  });
});

dev.get('/api/agendas/:agendaUid/settings/memberSchema/configure', (req, res) => {
  const response = getFixtures(req.params.agendaUid).memberSchema;
  res.json({
    ...response,
  });
});

dev.post('/api/agendas/:agendaUid/settings/memberSchema/configure', (req, res) => {
  res.json({
    ...true,
  });
});

module.exports = dev;
