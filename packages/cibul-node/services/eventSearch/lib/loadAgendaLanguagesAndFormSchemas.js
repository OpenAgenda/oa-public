export default (services) => async (req, res, next) => {
  const {
    formSchemas: {
      utils: { filterByAccess },
    },
  } = services;

  try {
    const result = await req.search(
      req.searchQuery,
      { size: 0 },
      {
        ...req.searchOptions,
        aggregations: ['languages', 'locations'],
        returnAgenda: true,
        includeLocationLegacyAdminLevels: false,
      },
    );

    const {
      result: {
        aggregations: { languages: languageCounts, locations },
      },
      agenda,
    } = result;

    req.languages = languageCounts
      .map((c) => c.key)
      .map((key) => key.toLowerCase())
      .reduce(
        (uniqueKeys, key) =>
          (uniqueKeys.includes(key) ? uniqueKeys : uniqueKeys.concat(key)),
        [],
      );

    req.hasMultipleLocations = locations.length > 1;

    req.agenda = agenda;

    req.formSchema = filterByAccess(
      req.agenda.schema,
      req.searchOptions.access,
    );

    next();
  } catch (err) {
    next(err);
  }
};
