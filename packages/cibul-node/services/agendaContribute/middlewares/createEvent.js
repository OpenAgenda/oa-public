import crypto from 'node:crypto';
import logs from '@openagenda/logs';
import handleError from '../lib/handleError.js';

const log = logs('services/agendaContribute/createEvent');

export default function createEvent(req, res) {
  const { core } = req.app;

  log(
    req.draft ? 'creating draft with %j' : 'creating event with %j',
    req.dataWithFiles,
  );

  core
    .agendas(req.agenda.uid)
    .events.create(req.dataWithFiles, {
      draft: req.draft,
      userUid: req.user.uid,
      fileKey: crypto.randomUUID().replace(/-/g, ''),
      duplicateOrigin: req.query.duplicateOrigin,
      userLang: req.lang,
    })
    .then(
      (event) => res.json({ success: true, event }),
      (error) => handleError({ res, log }, error),
    );
}
