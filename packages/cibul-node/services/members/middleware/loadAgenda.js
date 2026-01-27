import membersSvc from '@openagenda/members';

const { getRoleCode } = membersSvc.utils;

export default (req, res, next) => {
  const { agendas } = req.app.services;

  agendas
    .get(
      { slug: req.params.agendaSlug },
      {
        private: null,
        internal: true,
        includeImagePath: true,
      },
    )
    .then((agenda) => {
      if (!agenda) return next({ code: 404 });
      req.agenda = agenda;
      next();
    });
};

export function roles(req, res, next) {
  req.agendaRoles = ['contributor', 'administrator']
    .concat(req.agenda.credentials.moderators ? ['moderator'] : [])
    .concat(req.agenda.private ? ['reader'] : [])
    .map((s) => ({
      slug: s,
      code: getRoleCode(s),
    }));

  next();
}
