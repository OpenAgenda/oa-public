'use strict';

const setPageProp = require('../lib/utils/setPageProp');

module.exports = async (req, res, next) => {
  const proxy = req.app.get('proxy');
  const transform = req.app.get('transforms').event.show;

  const event = await proxy.get(res.locals.agendaUid, {
    slug: req.params.slug
  });

  if (!event) return next();

  req.data.event = transform(event, req, res);

  if (req.query.data !== undefined && process.env.NODE_ENV === 'development') {
    return res.json(Object.assign(req.data, req.app.locals));
  }

  setPageProp(req, 'pageType', 'event');

  res.render('event', req.data);
};
