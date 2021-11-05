const cors = require('cors');

const express = require('express');

const getFixtures = require('../fixtures');

const dev = express();
dev.use(express.json());

dev.use(cors());

dev.get('/api/agendas/:agendaUid', (req, res) => {
  res.json(getFixtures(req.params.agendaUid).agenda);
});

dev.get('/api/me/agendas/:agendaUid', (req, res) => {
  res.json(getFixtures(req.params.agendaUid).member);
});

dev.patch('/api/me/agendas/:agendaUid', (req, res) => {
  const member = JSON.parse(req.body.data);
  getFixtures(req.params.agendaUid).member = member;
  member.updatedAt = new Date();
  res.json(member);
});

dev.listen(process.env.EXPRESS_API_PORT);
