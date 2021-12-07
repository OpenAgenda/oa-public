'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/updateEvent');

const filterByAuth = require('../lib/filterByAuthorizations');
const handleError = require('../lib/handleError');

module.exports = function updateEvent(req, res) {
  const {
    core
  } = req.app;

  const undrafting = req.event.draft && !req.draft;
  const operation = undrafting ? 'update' : 'patch';

  const filteredData = filterByAuth(core, req.agenda.uid, req.authorizations, req.dataWithFiles);

  log('%s event %s', undrafting ? 'undrafting' : 'updating', req.event.uid);

  core.agendas(req.agenda.uid).events[operation](req.event.uid, filteredData, {
    draft: req.draft,
    userUid: req.user.uid,
    filterUnauthorizedData: true,
    private: null
  }).then(event => res.json({ success: true, event }), error => handleError({ res, log }, error));
};
