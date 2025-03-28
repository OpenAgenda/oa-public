export default () => async (req, res, next) => {
  try {
    req.stream = await req.search(req.searchQuery, null, {
      ...req.searchOptions,
      includeLocationLegacyAdminLevels: false,
      stream: true,
    });

    next();
  } catch (err) {
    next(err);
  }
};
