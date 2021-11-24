'use strict';

const { withDefaultFilterConfig } = require('@openagenda/react-filters');

module.exports = async (req, res, next) => {
  const {
    uid,
    root,
    defaultLang,
    filters: rawFilters,
    widgets
  } = req.app.locals;
  const { intlByLocale } = req.app;

  const lang = req.query.lang || defaultLang;
  const intl = intlByLocale[lang] || intlByLocale[defaultLang];

  const filters = rawFilters.map(rawFilter => withDefaultFilterConfig(rawFilter, intl));

  Object.assign(res.locals, {
    intl,
    agendaUid: uid || res.locals.agendaUid || req.params.agendaUid,
    agenda:
      req.app.locals.agenda
      || (await req.app.get('proxy').head(res.locals.agendaUid)),
    root: typeof root === 'function' ? root(res.locals.agenda) : root,
    lang,
    defaultLang,
    filters,
    widgets,
    query: req.query
  });

  next();
};
