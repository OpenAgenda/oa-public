'use strict';

module.exports = services => async (req, res, next) => {
  const {
    formSchemas: {
      utils: {
        filterByAccess
      }
    }
  } = services;

  try {
    const {
      result: {
        aggregations: {
          languages: languageCounts
        }
      },
      agenda
    } = await req.search(req.query, { size: 0 }, {
      aggregations: ['languages'],
      access: 'public',
      returnAgenda: true
    });

    req.languages = languageCounts.map(c => c.key);

    req.stream = await req.search(req.searchQuery, null, {
      ...req.searchOptions,
      stream: true
    });

    req.agenda = agenda;

    req.formSchema = filterByAccess(req.agenda.schema, req.searchOptions.access);

    next();
  } catch (err) {
    next(err);
  }
};
