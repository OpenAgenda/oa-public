import logs from '@openagenda/logs';

const log = logs('services/agendaContribute/addNewMember');

export default function addNewMember(req, res, next) {
  const { core } = req.app.services;

  if (req.member) {
    return next();
  }

  core
    .agendas(req.agenda)
    .members.create(req.user.uid, 'contributor', null, {
      userUid: req.user.uid,
    })
    .then((member) => {
      log(
        'created contributor reference for user %s on agenda %s',
        req.user.uid,
        req.agenda.uid,
      );
      req.member = member;
      next();
    });
}
