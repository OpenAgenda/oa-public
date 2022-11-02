'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const convertEventToLegacyFormat = require('@openagenda/legacy/convertEventToLegacyFormat');
const convertLegacyFilter = require('@openagenda/legacy/convertLegacyFilter');
const renderHTMLFromMarkdown = require('@openagenda/legacy/utils/renderHTMLFromMarkdown');

function isEnabled(req) {
  if (req.query.fromV2) {
    return true;
  }
  if (req.credentials?.useJSONBridge) {
    return true;
  }

  if (req.agenda?.credentials) {
    return (
      typeof req.agenda.credentials === 'string' ? JSON.parse(req.agenda.credentials) : req.agenda.credentials
    )?.useJSONBridge ?? false;
  }
  return false;
}

module.exports = function ConvertFormat({
  forceLimit = null,
  sendJSON = false,
  forceIncludeEmbedded = false,
  admin = false,
}) {
  const log = logs('agenda/ConvertFormat');
  return async (req, res, next) => {
    if (!isEnabled(req)) {
      log('info', 'Disabled. Using legacy JSON', req.params);
      return next();
    }

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
      ...convertLegacyFilter(req.query.oaq ?? {}, { formSchema, tagSet, categorySet }),
      ...req.query,
    }, ['page', 'oaq']);

    const agenda = await req.app.core.agendas(req.params.uid).get();

    const eventsList = await req.app.core
      .agendas(req.params.uid)
      .events.search(
        req.query,
        nav,
        { detailed: true, access: 'administrator' },
      );

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

    if (sendJSON) {
      res.json({
        readme: 'Results are paginated. See: https://developers.openagenda.com/export-json-dun-agenda/',
        ...response,
      });
      return;
    }

    Object.assign(req, response);
    next();
  };
};
