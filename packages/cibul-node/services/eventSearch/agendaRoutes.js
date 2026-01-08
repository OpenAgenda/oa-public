import { Router } from 'express';
import rateLimiter from '../../lib/rateLimiter.js';
import trackFormat from './lib/trackFormat.js';
import loadSearchEndpoint from './lib/loadSearchEndpoint.js';
import loadSearchStream from './lib/loadSearchStream.js';
import loadAgendaLanguagesAndFormSchemas from './lib/loadAgendaLanguagesAndFormSchemas.js';
import loadAgendaExportsSettings from './lib/loadAgendaExportsSettings.js';
import streamCSV from './lib/streamCSV.js';
import streamICS from './lib/streamICS.js';
import RSSResponse from './lib/RSSResponse.js';
import streamXLSX from './lib/streamXLSX.js';
import streamPDF from './lib/streamPDF.js';
import streamMarkdown from './lib/streamMarkdown.js';
import ifFormat from './lib/ifFormat.js';
import ifJSONStreamRequested from './lib/ifJSONStreamRequested.js';
import JSONResponse from './lib/JSONResponse.js';
import handleError from './lib/handleError.js';

export default (config, services) => {
  const { redis } = services;

  const limiter = rateLimiter(redis.ioRedis, {
    keyGenerator: (req) =>
      [req.ip, `export-${req.params.format}`]
        .concat(req.params.format === 'pdf' ? [] : req.params.agendaUid)
        .join('|'),
  });

  return {
    getPublic: () =>
      Router({
        mergeParams: true,
      }).get(
        '',
        ifFormat(['csv', 'xlsx', 'ics', 'txt', 'md', 'pdf'], limiter),
        ifFormat(
          ['csv', 'xlsx', 'ics', 'txt', 'md', 'pdf'],
          loadSearchEndpoint(services.core),
        ),
        ifFormat(
          ['rss', 'json'],
          loadSearchEndpoint(services.core, { convertLegacy: true }),
        ),
        loadAgendaLanguagesAndFormSchemas(services),
        ifFormat(['ics', 'txt', 'md'], loadSearchStream()),
        ifFormat(
          ['csv', 'xlsx'],
          loadSearchStream({
            omitOptions: ['aggregations'],
          }),
        ),
        ifFormat(
          ['pdf'],
          loadSearchStream({
            includeLocationLegacyAdminLevels: true,
            omitOptions: ['includeFields', 'aggregations'],
          }),
        ),
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
        ifFormat(['ics', 'txt', 'md'], loadSearchStream()),
        ifFormat(
          ['csv', 'xlsx'],
          loadSearchStream({
            omitOptions: ['aggregations'],
          }),
        ),
        ifFormat(
          ['pdf'],
          loadSearchStream({
            includeLocationLegacyAdminLevels: true,
            omitOptions: ['includeFields', 'aggregations'],
          }),
        ),
        trackFormat,
        ifJSONStreamRequested(loadSearchStream()),
        ifFormat('csv', streamCSV),
        ifFormat('xlsx', streamXLSX),
        ifFormat('pdf', streamPDF.bind(null, config.pdf)),
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
