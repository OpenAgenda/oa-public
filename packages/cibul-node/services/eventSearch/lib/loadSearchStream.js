import _ from 'lodash';

export default (options = {}) =>
  async (req, res, next) => {
    const { includeLocationLegacyAdminLevels = false, omitOptions } = options;
    try {
      req.stream = await req.search(req.searchQuery, null, {
        ...omitOptions
          ? _.omit(req.searchOptions, omitOptions)
          : req.searchOptions,
        includeLocationLegacyAdminLevels,
        stream: true,
      });

      next();
    } catch (err) {
      next(err);
    }
  };
