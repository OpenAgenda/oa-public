'use strict';

const { Router } = require('express');

const expressUtils = require('@openagenda/utils/express');
const loadSearchEndpoint = require('./lib/loadSearchEndpoint');
const loadSearchStream = require('./lib/loadSearchStream');
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
    mergeParams: true
  }).get(
    '',
    loadSearchEndpoint(services.core),
    ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md'], loadSearchStream(services)),
    ifFormat('csv', streamCSV),
    ifFormat('xlsx', streamXLSX),
    ifFormat('ics', streamICS),
    ifFormat(['md', 'txt'], streamMarkdown),
    ifFormat('rss', RSSResponse(services.core)),
    ifFormat('json', JSONResponse),
    (req, res) => res.status(400).send('Unknown format')
  ),
  getRestricted: () => Router({
    mergeParams: true
  }).get('',
    expressUtils.https,
    services.members.mw.authorizeAdminModOrKey({
      agendaUidPath: 'params.agendaUid'
    }),
    loadSearchEndpoint(services.core),
    ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md'], loadSearchStream(services)),
    ifJSONStreamRequested(loadSearchStream(services)),
    ifFormat('csv', streamCSV),
    ifFormat('xlsx', streamXLSX),
    ifFormat('ics', streamICS),
    ifFormat(['md', 'txt'], streamMarkdown),
    ifJSONStreamRequested(JSONResponse.streamResponse),
    ifFormat('rss', RSSResponse(services.core)),
    ifFormat('json', JSONResponse),
    handleError,
    (req, res) => res.status(400).send('Unknown format'))
});
