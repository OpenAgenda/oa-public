import logs from '@openagenda/logs';
import filterByAuth from '../lib/filterByAuthorizations.mjs';
import handleError from '../lib/handleError.mjs';

const log = logs('services/agendaContribute/addEvent');

export default function addEvent(req, res) {
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
      sourceAgenda: req.fromAgenda,
    },
  ).then(event => {
    res.json({
      success: true,
      event,
    });
  }, error => handleError({ res, log }, error));
};
