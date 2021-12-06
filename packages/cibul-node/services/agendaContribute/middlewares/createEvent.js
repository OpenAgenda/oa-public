'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/createEvent');

module.exports = function createEvent(req, res) {
  const {
    core
  } = req.app;

  log(req.draft ? 'creating draft with %j' : 'creating event with %j', req.dataWithFiles);

  core.agendas(req.agenda.uid).events.create(req.dataWithFiles, {
    draft: req.draft,
    userUid: req.user.uid,
    filterUnauthorizedData: true
  }).then(event => res.json({ success: true, event }), error => {
    if (error.name === 'BadRequest') {
      log('error', 'validation errors', error.info);

      res.status(400);

      res.json({
        success: false,
        errors: error.info,
        event: null
      });
    } else {
      log('error', error);

      res.status(500);

      res.json({
        success: false,
        event: null
      });
    }
  });
};
