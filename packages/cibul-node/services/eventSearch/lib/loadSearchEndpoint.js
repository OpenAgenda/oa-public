'use strict';

const convert = require('@openagenda/legacy/convertLegacyFilter');

const mapIncludeFields = includeFields => {
  if (!includeFields) return null;

  return includeFields.flatMap(field => {
    if (field === 'permalink') return 'uid';
    if (field === 'firstDate' || field === 'lastDate' || field === 'timings') return ['timings', 'timezone'];
    return field;
  });
};

module.exports = (core, options = {}) => async (req, res, next) => {
  req.search = core
    .agendas(req.params.agendaUid)
    .events.search;

  const {
    admin = false,
  } = options;

  const {
    includeFields,
  } = req.query;

  req.searchOptions = {
    aggregations: req.query.aggs,
    ...req.query,
    includeFields: mapIncludeFields(includeFields),
    stream: false,
    detailed: true,
    access: req.access ?? 'public',
  };

  req.searchQuery = {
    ...req.query,
  };

  const {
    legacy: {
      tagsAndCustom,
    },
  } = req.app.services;

  if (!admin) {
    req.searchQuery = {
      ...convert(
        req.searchQuery.oaq ?? {},
        {
          formSchema: await req.app.core.agendas(req.params.agendaUid).settings.get({ access: 'internal' }),
          tagSet: req.searchQuery?.oaq?.tags ? await tagsAndCustom.getTagSet(req.params.agendaUid) : null,
          categorySet: req.searchQuery?.oaq?.category ? await tagsAndCustom.getCategorySet(req.params.agendaUid) : null,
          query: req.searchQuery,
        },
      ),
      ...req.searchQuery,
    };

    delete req.searchQuery.oaq;
  }

  delete req.searchQuery.state;

  if (req.user?.uid) {
    req.searchOptions.userUid = req.user.uid;
    req.searchQuery.state = req.query.state === undefined ? null : req.query.state;
  }

  next();
};
