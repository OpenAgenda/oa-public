'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/createEvent');

const handleError = require('../lib/handleError');

module.exports = function createEvent(req, res) {
  const {
    core
  } = req.app;

  log(req.draft ? 'creating draft with %j' : 'creating event with %j', req.dataWithFiles);

  core.agendas(req.agenda.uid).events.create(req.dataWithFiles, {
    draft: req.draft,
    userUid: req.user.uid,
    filterUnauthorizedData: true,
    fileKey: req.fileKey,
    duplicateOrigin: req.query.duplicateOrigin,
  }).then(event => res.json({ success: true, event }), error => handleError({ res, log }, error));
};
