'use strict';

const log = require('@openagenda/logs')(
  'services/eventSearch/agendaRestrictedEventSearchRoutes'
);
const { Router } = require('express');
const expressUtils = require('@openagenda/utils/express');
const csv = require('@openagenda/flat-exports').csv();
const ICSStream = require('@openagenda/flat-exports').ICSStream;
const labels = require('@openagenda/labels/event/exportFieldNames');
const MarkdownStream = require('@openagenda/flat-exports').MarkdownStream;
const xlsx = require('@openagenda/flat-exports').xlsx();
const rss = require('@openagenda/flat-exports').rss;
const config = require('../../config');

module.exports = services => {
  const { core, members } = services;

  const router = Router({ mergeParams: true });

  router.get(
    '',
    expressUtils.https,
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'params.agendaUid' })
  );

  router.get('', async (req, res, next) => {
    const access = req.member.role === 2 ? 'administrator' : 'moderator';
    const { format } = req.params;

    try {
      if (format === 'json') {
        const { agenda, result } = await core
          .agendas(req.params.agendaUid)
          .events.search({
            state: null,
            ...req.query
          }, req.query, {
            ...req.query,
            access,
            returnAgenda: true
          });

        res.set({
          'Content-Type': 'application/json',
          'Content-disposition': `inline; filename="${agenda.slug}.agenda.json"`
        });

        return res.json(result);
      }

      if (['csv', 'xlsx', 'ics', 'md', 'txt', 'rss'].includes(format)) {
        const languagesResult = await core
          .agendas(req.params.agendaUid)
          .events.search(req.query, { size: 0 }, {
            aggregations: ['languages']
          });

        // this should be loaded from some agenda cache
        const languages = languagesResult.aggregations.languages.map(b => b.key);

        const {
          agenda,
          result: stream
        } = await core
          .agendas(req.params.agendaUid)
          .events.search(req.query, null, { detailed: true, returnAgenda: true, stream: true });

        switch (format) {
          case 'csv': {
            res.writeHead(200, {
              'Content-Type': 'text/csv',
              'Content-disposition': `attachment; filename="${agenda.slug}.agenda.csv"`
            });

            return csv(stream, {
              lang: req.lang,
              languages,
              labels
            }).pipe(res);
          }
          case 'xlsx': {
            res.writeHead(200, {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-disposition': `attachment; filename="${agenda.slug}.agenda.xlsx"`
            });

            return xlsx(stream, {
              lang: req.lang,
              languages,
              labels
            }).pipe(res);
          }
          case 'ics': {
            res.writeHead(200, {
              'Content-Type': 'text/calendar',
              'Content-disposition': `attachment; filename="${agenda.slug}.agenda.ics"`
            });

            const transform = new ICSStream({
              lang: req.lang,
              slug: agenda.slug,
              identifier: agenda.uid,
              title: agenda.title,
              description: agenda.description
            });

            return stream.pipe(transform).pipe(res);
          }
          case 'txt':
          case 'md': {
            res.writeHead(200, {
              'Content-Type': 'text/plain',
              'charset': 'utf-8',
              'Content-disposition': `attachment; filename="${agenda.slug}.agenda.${format}"`
            });

            const transform = new MarkdownStream({
              format,
              section: _getFirstSortField(req.query),
              lang: req.lang,
              slug: agenda.slug,
              identifier: agenda.uid,
              title: agenda.title,
              description: agenda.description,
              genUrl: e => 'https://openagenda.com/' + agenda.slug + '/events/' + e.slug
            });

            return stream.pipe(transform).pipe(res);
          }
          case 'rss': {
            const rssOptions = {
              title: agenda.title,
              description: agenda.description,
              feedURL: config.root + req.originalUrl,
              siteURL: config.root,
              imageURL: agenda.image ? config.aws.imageBucketPath + agenda.image : null,
              language: req.lang,
              pubDate: agenda.updatedAt
            };

            if (req.query.embed_url) {
              rssOptions.genUrl = e => query.embed_url + '?oaq[uid]=' + e.uid;
            }

            const feed = rss(rssOptions);

            for await (const event of stream) {
              feed.addEvent(event);
            }

            res.set({
              'Content-Type': 'application/rss+xml',
              'Content-disposition': `attachment; filename="${agenda.slug}.agenda.rss"`
            });

            return res.send(feed.xml());
          }
        }
      }

      return next();
    } catch (e) {
      next(e);
    }
  });

  // Error mw
  router.get('', (err, req, res, next) => {
    if (err.name === 'NotFoundError') {
      res.status(err.statusCode).send(null);
    } else if (err.name === 'BadRequest') {
      res.status(err.statusCode).json({
        error: err.detail,
        requested: req.query.aggregations
      });
    } else {
      res.status(500).send();
      log('error', err);
    }
  });

  return router;
};

function _getFirstSortField(query) {
  const firstSort = _.head(query.sort, null);

  if (!firstSort) return null;

  const parts = firstSort.split('.');

  parts.pop();

  return parts.join('.');
}
