'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/addEvent');

const filterByAuth = require('../lib/filterByAuthorizations');
const handleError = require('../lib/handleError');

module.exports = function addEvent(req, res) {
  const {
    core,
  } = req.app.services;

  core.agendas(req.agenda.uid).events.add(
    req.event.uid,
    filterByAuth(core, req.agenda.uid, req.authorizations, req.dataWithFiles),
    {
      draft: false,
      userUid: req.user.uid,
      filterUnauthorizedData: true,
      sourceAgenda: req.fromAgenda
    }
  ).then(event => {
    res.json({
      success: true,
      event
    });
  }, error => handleError({ res, log }, error));
};
