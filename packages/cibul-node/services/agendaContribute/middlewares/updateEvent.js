import logs from '@openagenda/logs';
import filterByAuth from '../lib/filterByAuthorizations.js';
import handleError from '../lib/handleError.js';

const log = logs('services/agendaContribute/updateEvent');

export default function updateEvent(req, res) {
  const { core } = req.app;

  const undrafting = req.event.draft && !req.draft;
  const operation = undrafting ? 'update' : 'patch';

  const filteredData = undrafting
    ? req.dataWithFiles
    : filterByAuth(core, req.agenda.uid, req.authorizations, req.dataWithFiles);

  log('%s event %s', undrafting ? 'undrafting' : 'updating', req.event.uid);

  core
    .agendas(req.agenda.uid)
    .events[operation](req.event.uid, filteredData, {
      draft: req.draft,
      userUid: req.user.uid,
      private: null,
      returnPayload: true,
    })
    .then(
      ({ updated, times }) => {
        req.times = times;
        res.json({ success: true, event: updated });
      },
      (error) => handleError({ res, log }, error),
    );
}
