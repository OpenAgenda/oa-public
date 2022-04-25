'use strict';

const _ = require('lodash');

const convertEventToLegacyFormat = require('@openagenda/legacy/convertEventToLegacyFormat');
const convertLegacyFilter = require('@openagenda/legacy/convertLegacyFilter');
const renderHTMLFromMarkdown = require('@openagenda/legacy/utils/renderHTMLFromMarkdown');

module.exports = async (req, res, next) => {
  if (!req.credentials.useJSONBridge && !req.query.fromV2) return next();

  const {
    legacy: {
      tagsAndCustom
    }
  } = req.app.services;

  const tagSet = await tagsAndCustom.getTagSet(req.params.uid);
  const categorySet = await tagsAndCustom.getCategorySet(req.params.uid);
  const formSchema = await req.app.core.agendas(req.params.uid).settings.get({ access: 'internal' });

  const nav = req.query.page ? {
    from: (parseInt(req.query.page, 10) - 1) * 20,
    size: req.query.limit ?? 20
  } : {
    from: parseInt(req.query.offset ?? 0, 10),
    size: parseInt(req.query.limit ?? 20, 10)
  };

  req.query = _.omit({
    ...convertLegacyFilter(req.query.oaq ?? {}, { formSchema, tagSet, categorySet }),
    ...req.query
  }, ['page', 'oaq']);

  const agenda = await req.app.core.agendas(req.params.uid).get();
  const eventsList = await req.app.core.agendas(req.params.uid).events.search(req.query, nav, { detailed: true, access: 'administrator' });

  const agendaSettings = {
    uid: req.params.uid,
    slug: agenda.slug,
    legacy: { tagSet, categorySet },
    formSchema,
    interfaces: {
      renderHTMLFromMarkdown: renderHTMLFromMarkdown.bind(null, req.app.services),
    },
    admin: req.access === 'administrator'
  };
  const convertedEvents = eventsList.events.map(event => convertEventToLegacyFormat(agendaSettings, event));

  res.json({
    readme: 'Results are paginated. See: https://developers.openagenda.com/export-json-dun-agenda/',
    total: eventsList.total,
    events: convertedEvents,
    ...nav
  });
};
