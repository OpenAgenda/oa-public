export default (req, res, next) => {
  req.app.render('partials/list', req.data, (err, html) => {
    if (err) return next(err);

    res.json({
      html,
      total: req.data.total,
      aggregations: req.data.aggregations,
    });
  });
};
