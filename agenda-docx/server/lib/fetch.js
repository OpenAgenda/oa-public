'use strict';

const fs = require('fs');
const sa = require('superagent');
const log = require('@openagenda/logs')('fetch');

const EVENTS_MAX_LIMIT = Infinity;

function loadEventsFromFile(file) {
  return new Promise((rs, rj) => {
    fs.readFile(file, 'utf-8', (err, content) => {
      if (err) return rj(err);

      rs(JSON.parse(content));
    });
  });
}

async function loadAgendaDetails(agendaUid) {
  log('loading agenda details for %s', agendaUid);

  return sa
    .get(`https://openagenda.com/agendas/${agendaUid}/settings.json`)
    .then(result => result.body);
}

function _fetch(agendaUid, offset, limit, query) {
  log(
    'fetching %s',
    `https://openagenda.com/agendas/${agendaUid}/events.json`,
    { offset, limit, query }
  );

  return sa
    .get(`https://openagenda.com/agendas/${agendaUid}/events.json`, {
      offset,
      limit,
      oaq: query,
    })
    .then(result => result.body.events);
}

async function fetchAndStoreEvents(destFolder, agendaUid, query) {
  log('fetchAndStoreEvents for %s', agendaUid);

  const limit = 100;
  let offset = 0;
  let events = [];
  let fetched = await _fetch(agendaUid, offset, limit, query);

  while (fetched.length && offset + limit <= EVENTS_MAX_LIMIT) {
    events = events.concat(fetched);
    offset += limit;

    fetched = await _fetch(agendaUid, offset, limit, query);
  }

  return new Promise((rs, rj) => {
    const filePath = `${destFolder}/${agendaUid}.events.json`;

    log('storing fetched events for %s at path %s', agendaUid, filePath);

    fs.writeFile(filePath, JSON.stringify(events, null, 3), 'utf-8', err => {
      if (err) return rj(err);

      rs(filePath);
    });
  });
}

module.exports = {
  fetchAndStoreEvents,
  loadEventsFromFile,
  loadAgendaDetails,
};
