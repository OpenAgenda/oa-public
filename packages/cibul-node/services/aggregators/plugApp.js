import bodyParser from 'body-parser';
import isURL from 'validator/lib/isURL.js';
import validators from '@openagenda/validators';
import _ from 'lodash';

export default (config, parentApp) => {
  const { sessions, agendas, members, aggregators } = parentApp.services;

  // this stays
  parentApp.all(
    [
      '/:agendaSlug/admin/aggregator',
      '/:agendaSlug/admin/sources(/*?)?',
      '/:agendaSlug/admin/sources/remove',
    ],
    [
      sessions.mw.loadOrRedirect(),
      agendas.mw.load,
      agendas.mw.authorizeByIPAddress(),
      members.mw.loadAndAuthorize('administrator'),
    ],
  );

  parentApp.post(
    '/:agendaSlug/admin/sources',
    bodyParser.json(),
    agendas.mw.loadBy({
      path: 'body.agendaUid',
      field: 'uid',
      target: 'sourceAgenda',
    }),
    (req, res, next) =>
      aggregators.sources
        .add(req.agenda, req.sourceAgenda, req.body.rules, {
          query: req.body.query,
          context: {
            user: req.user,
            member: req.member,
          },
        })
        .then(res.json.bind(res), next),
  );

  parentApp.get(
    '/:agendaSlug/admin/aggregator',
    bodyParser.json(),
    (req, res, next) =>
      aggregators.get(req.agenda.uid, { detailed: true }).then((result) => {
        if (!result) {
          return res.status(404).send('Aggregator not found');
        }

        res.json(result);
      }, next),
  );

  parentApp.post(
    '/:agendaSlug/admin/aggregator',
    bodyParser.json(),
    (req, res, next) =>
      aggregators
        .set(req.agenda.uid, req.body)
        .then((result) => res.json(result), next),
  );

  const validatePage = validators.integer({
    min: 1,
    default: 1,
  });

  const limit = 20;

  parentApp.get(
    '/:agendaSlug/admin/sources/search',
    bodyParser.json(),
    (req, res, next) => {
      const query = {};
      if (_.isInteger(parseInt(req.query?.search, 10))) {
        query.uid = parseInt(req.query?.search, 10);
      } else if (req.query?.search && isURL(req.query.search)) {
        const uidOrSlug = req.query?.search.split('/').pop().split('?').shift();
        const isUID = _.isInteger(parseInt(uidOrSlug, 10));

        query[isUID ? 'uid' : 'slug'] = isUID
          ? parseInt(uidOrSlug, 10)
          : uidOrSlug;
      } else if (req.query?.search?.length) {
        query.search = req.query.search;
      }

      agendas.list(
        query,
        (validatePage(req.query.searchPage) - 1) * limit,
        limit,
        { total: true, includeImagePath: true },
        (err, agendasResp, total) => {
          if (err) {
            return next(err);
          }
          res.json({ agendas: agendasResp, total });
        },
      );
    },
  );

  parentApp.put(
    '/:agendaSlug/admin/sources/:sourceId',
    bodyParser.json(),
    (req, res, next) =>
      aggregators.sources
        .update(req.agenda, req.params.sourceId, req.body.rules, {
          query: req.body.query,
        })
        .then(res.json.bind(res), next),
  );

  parentApp.delete('/:agendaSlug/admin/sources/:sourceId', (req, res, next) =>
    aggregators.sources
      .remove(req.agenda, req.params.sourceId, {
        evaluate: [true, 1, 'true', '1'].includes(req.query.evaluate),
        context: {
          user: req.user,
          member: req.member,
        },
      })
      .then(res.json.bind(res), next));

  parentApp.get(
    '/agendas/:uid/sources.json',
    agendas.mw.loadBy({ path: 'params.uid', field: 'uid' }),
    (req, res, next) =>
      aggregators.sources.list(req.agenda, {}, { detailed: true }).then(
        (result) =>
          res.json({
            total: result.sources.length,
            agendas: result.sources.map((source) => source.agenda),
          }),
        next,
      ),
  );
};
