export default (options = {}) =>
  async (req, res, next) => {
    const { includeLocationLegacyAdminLevels = false } = options;
    try {
      req.stream = await req.search(req.searchQuery, null, {
        ...req.searchOptions,
        includeLocationLegacyAdminLevels,
        stream: true,
      });

      next();
    } catch (err) {
      next(err);
    }
  };
