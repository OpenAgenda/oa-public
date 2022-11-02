'use strict';

module.exports = () => async (req, res, next) => {
  try {
    req.stream = await req.search(req.searchQuery, null, {
      ...req.searchOptions,
      stream: true,
    });

    next();
  } catch (err) {
    next(err);
  }
};
