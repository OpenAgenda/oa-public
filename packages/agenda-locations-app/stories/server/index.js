'use strict';

const _ = require('lodash');
const cors = require('cors');
const express = require('express');
const getFixtures = require('../fixtures');

const dev = express();
dev.use(express.json());

dev.use(cors());

dev.get('/api/agendas/:agendaUid/locations', (req, res) => {
  const response = getFixtures(req.params.agendaUid).locations;

  const allLocations = response.locations.map(l => (req.query.detailed ? l : _.pick(l, ['uid', 'name', 'address', 'latitude', 'longitude', 'state'])))
    .filter(l => {
      if (req.query.search && !l.name.includes(req.query.search)) return false;
      return true;
    });
  const locations = allLocations.slice(req.query.from, req.query.from + req.query.size);
  console.log(req.query, locations.length);
  res.json({
    ...response,
    locations,
    size: locations.length,
    from: req.query.from,
    total: allLocations.length
  });
});

dev.listen(process.env.EXPRESS_API_PORT);
