'use strict';

const setPageProp = require('../lib/utils/setPageProp');

module.exports.get = async (req, res, next) => {
  const proxy = req.app.get('proxy');
  const transform = req.app.get('transforms').event.show;

  const event = await proxy.get(res.locals.agendaUid, {
    slug: req.params.slug,
  });

  if (!event) return next();

  req.data.event = transform(event, req, res);

  setPageProp(req, 'pageType', 'event');

  next();
};

module.exports.render = (req, res, next) => {
  if (!req.data.event) {
    return next();
  }

  if (req.query.data !== undefined && process.env.NODE_ENV === 'development') {
    return res.json(Object.assign(req.data, req.app.locals));
  }

  res.render('event', req.data);
};
