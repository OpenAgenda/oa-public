import convert from '@openagenda/legacy/convertLegacyFilter/index.js';

function extractIncludeFields(query) {
  if (query.includeFields) {
    return query.includeFields;
  }
  return query.if;
}

const mapIncludeFields = (includeFields) => {
  if (!includeFields) return null;

  return includeFields.flatMap((field) => {
    if (field === 'permalink') return 'uid';
    if (field === 'firstDate' || field === 'lastDate' || field === 'timings') return ['timings', 'timezone'];
    return field;
  });
};

export default (core, options = {}) =>
  async (req, res, next) => {
    try {
      req.search = core.agendas(req.params.agendaUid).events.search;

      const { convertLegacy = false } = options;

      const includeFields = extractIncludeFields(req.query);

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

      if (convertLegacy) {
        req.searchQuery = {
          ...convert(req.searchQuery.oaq ?? {}, {
            formSchema: await req.app.core
              .agendas(req.params.agendaUid)
              .settings.get({
                access: 'internal',
              }),
            query: req.searchQuery,
          }),
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
    } catch (error) {
      next(error);
    }
  };
