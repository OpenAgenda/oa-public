'use strict';

module.exports = (req, res, next) => {
  req.app.render('partials/list', req.data, (err, html) => {
    if (err) return next(err);

    res.json({ html, total: req.data.total });
  });
};
