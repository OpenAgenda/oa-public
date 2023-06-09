const _ = require('lodash');
const cors = require('cors');
const logs = require('@openagenda/logs');
const express = require('express');

const log = logs('stories/server');

const getFixtures = require('./fixtures');
const locationsAPIResponse = require('./fixtures/locations.json');

const { getLocation } = getFixtures;
const dev = express();
dev.use(express.json());

dev.use(cors());

dev.get('/api/agendas/:agendaUid', (req, res) => {
  res.json(getFixtures(req.params.agendaUid).agenda);
});

dev.get('/api/agendas/:agendaUid/locations', (req, res) => {
  if (req.query.itemsKey === 'items') {
    return res.json({
      ..._.omit(locationsAPIResponse, 'locations'),
      items: locationsAPIResponse.locations,
    });
  }
  res.json(locationsAPIResponse);
});

dev.get('/api/me/agendas/:agendaUid', (req, res) => {
  const {
    agendaContext,
  } = getFixtures(req.params.agendaUid);

  if (!agendaContext) {
    res.status(404).send();
  } else {
    res.json(agendaContext);
  }
});

dev.get('/api/me/agendas/:agendaUid/events/:eventUid', (req, res) => {
  res.json(getFixtures(req.params.agendaUid).eventContext);
});

dev.get('/api/agendas/:agendaUid/events/:eventUid', (req, res) => {
  res.json(getFixtures(req.params.agendaUid).event);
});

dev.delete('/api/agendas/:agendaUid/events/:eventUid', (req, res) => {
  res.status(200).send();
});

dev.get('/locations/:uid.json', (req, res) => {
  res.json(getLocation(req.params.uid));
});

function setMember(req, res) {
  const member = JSON.parse(req.body.data);
  const fx = getFixtures(req.params.agendaUid);

  fx.agendaContext = {
    me: { member, authorizations: { canCreateEvent: true }, isValid: true },
  };

  member.updatedAt = new Date();
  log('member is set');
  res.json(member);
}

dev.post('/api/agendas/:agendaUid/members', setMember);
dev.patch('/api/agendas/:agendaUid/members/:userUid', setMember);

dev.post('/:agendaSlug/contribute', [
  (req, res) => {
    const createdEvent = {
      ...JSON.parse(req.body.data),
      uid: Math.floor(Math.random() * 10000000),
      state: 0,
      draft: req.query.draft === 'true',
    };

    res.json({ event: createdEvent });
  },
]);

dev.post('/:agendaSlug/contribute/event/:eventUid', (req, res) => {
  const {
    eventUid,
  } = req.params;

  const statusCode = getFixtures(req.params.agendaSlug)?.postResponseStatusCode ?? 200;

  if (statusCode >= 400) {
    return res.status(statusCode).send();
  }

  const updatedEvent = {
    ...JSON.parse(req.body.data),
    uid: parseInt(eventUid, 10),
  };

  res.json({ event: updatedEvent });
});

dev.post('/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid', (req, res) => {
  const sharedEvent = {
    ...getFixtures(req.params.fromAgendaUid).event.event,
    ...req.body.data ? JSON.parse(req.body.data) : {},
  };

  res.json({ event: sharedEvent });
});

module.exports = dev;
