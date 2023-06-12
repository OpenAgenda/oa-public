'use strict';

const { Router } = require('express');

const gaTrackFormat = require('./lib/gaTrackFormat');
const loadSearchEndpoint = require('./lib/loadSearchEndpoint');
const loadSearchStream = require('./lib/loadSearchStream');
const loadAgendaLanguagesAndFormSchemas = require('./lib/loadAgendaLanguagesAndFormSchemas');
const loadAgendaExportsSettings = require('./lib/loadAgendaExportsSettings');
const streamCSV = require('./lib/streamCSV');
const streamICS = require('./lib/streamICS');
const RSSResponse = require('./lib/RSSResponse');
const streamXLSX = require('./lib/streamXLSX');
const streamMarkdown = require('./lib/streamMarkdown');
const ifFormat = require('./lib/ifFormat');
const ifJSONStreamRequested = require('./lib/ifJSONStreamRequested');
const JSONResponse = require('./lib/JSONResponse');
const handleError = require('./lib/handleError');

module.exports = services => ({
  getPublic: () => Router({
    mergeParams: true,
  }).get(
    '',
    ifFormat(
      ['csv', 'xlsx', 'ics', 'txt', 'md'],
      loadSearchEndpoint(services.core),
    ),
    ifFormat(
      ['rss', 'json'],
      loadSearchEndpoint(services.core, { convertLegacy: true }),
    ),
    loadAgendaLanguagesAndFormSchemas(services),
    ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md'], loadSearchStream()),
    gaTrackFormat,
    ifFormat('csv', streamCSV),
    ifFormat('xlsx', streamXLSX),
    ifFormat('ics', streamICS),
    ifFormat(['md', 'txt'], streamMarkdown),
    ifFormat('rss', RSSResponse(services.core)),
    ifFormat('json', JSONResponse),
    (req, res) => res.status(400).send('Unknown format'),
  ),
  getRestricted: () => Router({
    mergeParams: true,
  }).get('', [
    services.members.mw.authorizeAdminModOrKey({
      agendaUidPath: 'params.agendaUid',
    }),
    loadSearchEndpoint(services.core, { admin: true }),
    loadAgendaLanguagesAndFormSchemas(services),
    ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md'], loadSearchStream()),
    gaTrackFormat,
    ifJSONStreamRequested(loadSearchStream()),
    ifFormat('csv', streamCSV),
    ifFormat('xlsx', streamXLSX),
    ifFormat('ics', streamICS),
    ifFormat(['md', 'txt'], streamMarkdown),
    ifJSONStreamRequested(JSONResponse.streamResponse),
    ifFormat('rss', RSSResponse(services.core)),
    ifFormat('json', JSONResponse),
    handleError,
    (req, res) => res.status(400).send('Unknown format'),
  ]),
  getAgendaExportsSettings: ({ admin } = false) => [
    admin ? services.members.mw.authorizeAdminModOrKey({
      agendaUidPath: 'params.agendaUid',
    }) : (req, res, next) => { next(); },
    loadSearchEndpoint(services.core),
    loadAgendaLanguagesAndFormSchemas(services),
    loadAgendaExportsSettings(services),
  ],
});
