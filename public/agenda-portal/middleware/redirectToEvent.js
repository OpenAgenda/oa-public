'use strict';

module.exports = async (req, res, next) => {
  const transform = req.app.get('transforms').event.show;

  const event = await req.app.get('proxy').get(res.locals.agendaUid, {
    uid: req.params.uid
  });

  if (!event) return next();

  res.redirect(301, transform(event, req, res).link);
};
