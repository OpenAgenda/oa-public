'use strict';

module.exports = service => (req, res, next) => {
  const endpoints = req.agenda.locationSetUid ? service.sets(req.agenda.locationSetUid) : service(req.agenda.uid);
  endpoints.settings.get({
    lang: req.lang,
    agendaUid: req.agenda.uid
  }).then(settings => {
    req.settings = settings;
    req.locations = req.agenda.locationSetUid ? endpoints.locations : endpoints;
    next();
  });
}