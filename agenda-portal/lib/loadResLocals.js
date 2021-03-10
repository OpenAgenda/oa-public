'use strict';

module.exports = async (req, res, next) => {
  const { uid, root, defaultLang } = req.app.locals;

  Object.assign(res.locals, {
    agendaUid: uid || res.locals.agendaUid || req.params.agendaUid,
    agenda:
      req.app.locals.agenda
      || (await req.app.get('proxy').head(res.locals.agendaUid)),
    root: typeof root === 'function' ? root(res.locals.agenda) : root,
    lang: req.query.lang || defaultLang,
    defaultLang,
  });

  next();
};
