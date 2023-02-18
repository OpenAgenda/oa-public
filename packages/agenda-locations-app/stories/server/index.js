'use strict';

const _ = require('lodash');
const cors = require('cors');
const express = require('express');
const multer = require('multer');
const { makeMiddleware: makeFilesMw } = require('@openagenda/files');
const getFixtures = require('../fixtures');
const locationJson = require('../fixtures/location.json');

const filesMw = makeFilesMw(multer());
const dev = express();
dev.use(express.urlencoded({ extended: true }));
dev.use(express.json());
dev.use(filesMw([{ name: 'image', unique: true }]));

dev.use(cors());

dev.get('/api/agendas/:agendaUid/locations', (req, res) => {
  if (req.params.agendaUid === 4) {
    res.status(500).send('Something broke!');
    return;
  }
  const response = getFixtures(req.params.agendaUid).locations;
  const allLocations = response.locations.map(l => (req.query.detailed ? l : _.pick(l, ['uid', 'name', 'address', 'latitude', 'longitude', 'state'])))
    .filter(l => {
      if (req.query.search && !l.name.includes(req.query.search)) return false;
      return true;
    });
  const locations = allLocations.slice(req.query.from, req.query.from + req.query.size);
  const resLocations = req.query.uids ? allLocations.filter(l => req.query.uids.find(e => parseInt(e, 10) === l.uid)) : locations;
  console.log('Get Locations', req.query, resLocations.length);
  const total = req.query.uids ? resLocations.length : allLocations.length;
  res.json({
    ...response,
    items: resLocations,
    size: resLocations.length,
    from: req.query.from,
    total
  });
});

dev.get('/api/agendas/:agendaUid/locations/settings', (req, res) => {
  const { settings } = getFixtures(req.params.agendaUid);
  console.log('Get Settings');
  if (parseInt(req.params.agendaUid, 10) === 2) {
    settings.set = {
      title: 'Les lieux en Ardèche',
      uid: 1903810,
      agendasCount: 3,
      locationsCount: 5
    };
  }
  res.json({
    ...settings
  });
});

dev.post('/api/agendas/:agendaUid/locations/merge', (req, res) => {
  if (parseInt(req.params.agendaUid, 10) === 4) {
    console.log('sent 5OO');
    res.status(500).send('Something broke!');
  } else {
    console.log('Merge');
    res.json({
      result: { success: true }
    });
  }
});

dev.get('/api/agendas/:agendaUid/locations/geocode/reverse', (req, res) => {
  res.json({
    results: [
      {
        address:
          'École Maternelle Alphonse Daudet, Rue Fallet, 92400 Courbevoie, France',
        adminLevel1: 'Île-de-France reversed',
        adminLevel2: 'Hauts-de-Seine',
        adminLevel4: 'Courbevoie',
        adminLevel6: 'Quartier de Bécon',
        postalCode: '92400',
        timezone: 'Europe/Paris',
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
        country: 'France',
        countryCode: 'fr',
      }
    ]
  });
});

dev.get('/api/agendas/:agendaUid/locations/geocode', (req, res) => res.json({
  results: [
    {
      address:
        'École Maternelle Alphonse Daudet, Rue Fallet, 92400 Courbevoie, France',
      adminLevel1: 'Île-de-France',
      adminLevel2: 'Hauts-de-Seine',
      adminLevel4: 'Courbevoie',
      adminLevel6: 'Quartier de Bécon',
      postalCode: '92400',
      timezone: 'Europe/Paris',
      latitude: 48.9019071,
      longitude: 2.2789371,
      country: 'France',
      countryCode: 'fr',
    }
  ]
}));

dev.get('/locations/:locationUid.json', (req, res) => {
  console.log('Get Location JSON', req.params.locationUid);
  res.json({
    ...locationJson,
  });
});

dev.get('/api/agendas/:agendaUid/locations/:locationUid/', (req, res) => {
  console.log('Get Location', req.params.locationUid);
  const allLocations = getFixtures(req.params.agendaUid).locations;
  const location = allLocations.locations.filter(e => e.uid === parseInt(req.params.locationUid, 10))[0];
  res.json({
    location,
    success: true
  });
});


dev.post('/api/agendas/:agendaUid/locations/', (req, res) => {
  if (parseInt(req.params.agendaUid, 10) === 4) {
    res.status(500).send('Something broke!');
    return;
  }
  console.log('create', req.body);
  res.json({
    location: req.body,
    success: true
  });
});

dev.delete('/api/agendas/:agendaUid/locations/:locationUid', (req, res) => {
  if (parseInt(req.params.agendaUid, 10) === 4) {
    res.status(500).send('Something broke!');
    return;
  }
  console.log('delete', req.body);
  res.json({
    ...req.location
  });
});

module.exports = dev;
