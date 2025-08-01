import fs from 'node:fs';
import logs from '@openagenda/logs';

const log = logs('fetch');

const EVENTS_MAX_LIMIT = Infinity;

export function loadEventsFromFile(file) {
  return new Promise((rs, rj) => {
    fs.readFile(file, 'utf-8', (err, content) => {
      if (err) return rj(err);

      rs(JSON.parse(content));
    });
  });
}

export async function loadAgendaDetails(agendaUid) {
  log('loading agenda details for %s', agendaUid);

  return fetch(
    `https://openagenda.com/agendas/${agendaUid}/settings.json`,
  ).then((result) => result.json());
}

function _fetch(agendaUid, offset, limit, query) {
  log(
    'fetching %s',
    `https://openagenda.com/agendas/${agendaUid}/events.json`,
    { offset, limit, query },
  );

  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
    oaq: query || '',
  });

  return fetch(
    `https://openagenda.com/agendas/${agendaUid}/events.json?${params}`,
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => result.events);
}

export async function fetchAndStoreEvents(destFolder, agendaUid, query) {
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

    fs.writeFile(filePath, JSON.stringify(events, null, 3), 'utf-8', (err) => {
      if (err) return rj(err);

      rs(filePath);
    });
  });
}
