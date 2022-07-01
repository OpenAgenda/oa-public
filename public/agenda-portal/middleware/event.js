'use strict';

const setPageProp = require('../lib/utils/setPageProp');

module.exports.get = async (req, res, next) => {
  const proxy = req.app.get('proxy');
  const transform = req.app.get('transforms').event.show;

  try {
    const event = await proxy.get(res.locals.agendaUid, {
      slug: req.params.slug,
    });

    if (!event) return next();

    req.data.event = transform(event, req, res);

    setPageProp(req, 'pageType', 'event');
    setPageProp(req, 'lang', res.locals.lang);
    setPageProp(req, 'defaultViewport', res.locals.agenda.summary.viewport);
    setPageProp(req, 'agendaUid', res.locals.agenda.uid);
  } catch (err) {
    return next(err);
  }

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
