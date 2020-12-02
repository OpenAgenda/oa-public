'use strict';

module.exports = async (req, res, next) => {
  const { uid, root, lang } = req.app.locals;

  res.locals.agendaUid = uid || res.locals.agendaUid || req.params.agendaUid;

  res.locals.agenda = req.app.locals.agenda
    || (await req.app.get('proxy').head(res.locals.agendaUid));

  res.locals.root = typeof root === 'function' ? root(res.locals.agenda) : root;

  res.locals.lang = lang;

  next();
};
