"use strict";

module.exports = ({ detailed } = {}) => {
  return async (req, res, next) => {
    const {
      sessions,
      users
    } = req.app.services;

    const { key } = req.query;

    if (key) {
      const user = await users.findOne({
        query: {
          key
        },
        detailed
      });

      if (user) {
        req.user = user;
      }

      return next();
    }

    sessions.get(req, { detailed }, (err, user) => {
      if (err) {
        return next(err);
      }

      if (user) {
        req.user = user;
      }

      next();
    });
  };
}
