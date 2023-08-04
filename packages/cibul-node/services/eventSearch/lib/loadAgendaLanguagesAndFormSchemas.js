'use strict';

module.exports = services => async (req, res, next) => {
  const {
    formSchemas: {
      utils: {
        filterByAccess,
      },
    },
  } = services;

  try {
    const {
      result: {
        aggregations: {
          languages: languageCounts,
        },
      },
      agenda,
    } = await req.search(req.searchQuery, { size: 0 }, {
      ...req.searchOptions,
      aggregations: ['languages'],
      returnAgenda: true,
      includeLocationLegacyAdminLevels: false,
    });

    req.languages = languageCounts.map(c => c.key);

    req.agenda = agenda;

    req.formSchema = filterByAccess(req.agenda.schema, req.searchOptions.access);

    next();
  } catch (err) {
    next(err);
  }
};
