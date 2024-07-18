import { Router } from 'express';
import rateLimiter from '../../lib/rateLimiter.js';
import trackFormat from './lib/trackFormat.mjs';
import loadSearchEndpoint from './lib/loadSearchEndpoint.mjs';
import loadSearchStream from './lib/loadSearchStream.mjs';
import loadAgendaLanguagesAndFormSchemas from './lib/loadAgendaLanguagesAndFormSchemas.mjs';
import loadAgendaExportsSettings from './lib/loadAgendaExportsSettings.mjs';
import streamCSV from './lib/streamCSV.mjs';
import streamICS from './lib/streamICS.mjs';
import RSSResponse from './lib/RSSResponse.mjs';
import streamXLSX from './lib/streamXLSX.mjs';
import streamPDF from './lib/streamPDF.mjs';
import streamMarkdown from './lib/streamMarkdown.mjs';
import ifFormat from './lib/ifFormat.mjs';
import ifJSONStreamRequested from './lib/ifJSONStreamRequested.mjs';
import JSONResponse from './lib/JSONResponse.mjs';
import handleError from './lib/handleError.mjs';

export default (config, services) => {
  const { redis } = services;

  const limiter = rateLimiter(redis.ioRedis, {
    keyGenerator: req =>
      [req.ip, `export-${req.params.format}`].concat(req.params.format === 'pdf' ? [] : req.params.agendaUid).join('|'),
  });

  return {
    getPublic: () =>
      Router({
        mergeParams: true,
      }).get(
        '',
        ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md', 'pdf'], limiter),
        ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md', 'pdf'], loadSearchEndpoint(services.core)),
        ifFormat(['rss', 'json'], loadSearchEndpoint(services.core, { convertLegacy: true })),
        loadAgendaLanguagesAndFormSchemas(services),
        ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md', 'pdf'], loadSearchStream()),
        trackFormat,
        ifFormat('csv', streamCSV),
        ifFormat('xlsx', streamXLSX),
        ifFormat('pdf', streamPDF.bind(null, config.pdf)),
        ifFormat('ics', streamICS),
        ifFormat(['md', 'txt'], streamMarkdown),
        ifFormat('rss', RSSResponse(services.core)),
        ifFormat('json', JSONResponse),
        (req, res) => res.status(400).send('Unknown format'),
      ),
    getRestricted: () =>
      Router({
        mergeParams: true,
      }).get(
        '',
        ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md'], limiter),
        services.members.mw.authorizeAdminModOrKey({
          agendaUidPath: 'params.agendaUid',
        }),
        loadSearchEndpoint(services.core, { admin: true }),
        loadAgendaLanguagesAndFormSchemas(services),
        ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md'], loadSearchStream()),
        trackFormat,
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
      ),
    getAgendaExportsSettings: ({ admin } = false) => [
      admin
        ? services.members.mw.authorizeAdminModOrKey({
          agendaUidPath: 'params.agendaUid',
        })
        : (req, res, next) => {
          next();
        },
      loadSearchEndpoint(services.core),
      loadAgendaLanguagesAndFormSchemas(services),
      loadAgendaExportsSettings(services),
    ],
  };
};
