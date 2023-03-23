'use strict';

const _ = require('lodash');

const convertEventToLegacyFormat = require('@openagenda/legacy/convertEventToLegacyFormat');
const convertLegacyFilter = require('@openagenda/legacy/convertLegacyFilter');
const renderHTMLFromMarkdown = require('@openagenda/legacy/utils/renderHTMLFromMarkdown');
const log = require('@openagenda/logs')('ConvertFormat');
const gaTrack = require('../lib/gaTrack');

module.exports = function ConvertFormat({
  forceLimit = null,
  sendJSON = false,
  forceIncludeEmbedded = false,
  admin = false,
  ga = null,
}) {
  return async (req, res, next) => {
    const {
      legacy: {
        tagsAndCustom,
      },
      core,
    } = req.app.services;

    const config = core.getConfig();

    const tagSet = await tagsAndCustom.getTagSet(req.params.uid);
    const categorySet = await tagsAndCustom.getCategorySet(req.params.uid);
    const formSchema = await req.app.core.agendas(req.params.uid).settings.get({ access: 'internal' });

    const nav = req.query.page ? {
      from: (parseInt(req.query.page, 10) - 1) * 20,
      size: forceLimit === null ? req.query.limit ?? 20 : forceLimit,
    } : {
      from: parseInt(req.query.offset ?? 0, 10),
      size: forceLimit === null ? parseInt(req.query.limit ?? 20, 10) : forceLimit,
    };

    req.query = _.omit({
      ...convertLegacyFilter(req.query.oaq ?? {}, { formSchema, tagSet, categorySet, query: req.query }),
      ...req.query,
    }, ['page', 'oaq']);

    const agenda = await req.app.core.agendas(req.params.uid).get({
      private: admin ? null : undefined,
    });

    if (!agenda) {
      return next({ code: 404 });
    }

    if (ga) {
      gaTrack(req, agenda, ...ga);
    }

    const {
      result: eventsList,
      error,
    } = await req.app.core
      .agendas(req.params.uid)
      .events.search(
        req.query,
        nav,
        { detailed: true, access: 'administrator' },
      )
      .then(result => ({ result }), e => ({ error: e }));

    if (error) {
      return next(error);
    }

    const agendaSettings = {
      uid: req.params.uid,
      slug: agenda.slug,
      legacy: { tagSet, categorySet },
      formSchema,
      interfaces: {
        renderHTMLFromMarkdown: renderHTMLFromMarkdown.bind(null, req.app.services, {
          includeEmbedded: forceIncludeEmbedded || (req.query.include_embedded === '1'),
        }),
      },
      admin,
      root: config.root,
    };

    const convertedEvents = eventsList.events.map(event => convertEventToLegacyFormat(agendaSettings, event));

    const response = {
      total: eventsList.total,
      offset: nav.from,
      limit: nav.size,
      events: convertedEvents,
    };

    const readme = 'Results are paginated. See: https://developers.openagenda.com/export-json-dun-agenda/';

    if (sendJSON && req.query.callback) {
      res.send(`${req.query.callback}(${JSON.stringify({
        readme,
        ...response,
      })})`);
    } else if (sendJSON) {
      res.json({
        readme,
        ...response,
      });
    } else {
      Object.assign(req, response);
      next();
    }
  };
};
