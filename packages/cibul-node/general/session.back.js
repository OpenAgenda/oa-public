// retrieve additional stuff related to current user session
function loadDetailed(req, res, next) {
  const { members } = req.app.services;
  members
    .list(
      {
        userUid: req.user.uid,
      },
      {
        limit: 1000,
      },
      {
        detailed: true,
      },
    )
    .then((memberRefs) => {
      req.user.agendas = memberRefs
        .filter((member) => member.agenda)
        .map((member) => ({
          uid: member.agenda.uid,
          title: member.agenda.title,
          role: members.utils.getRoleSlug(member.role),
        }));
      next();
    });
}

export default (app) => {
  const { sessions } = app.services;

  app.get(
    '/session',
    sessions.mw.ifUnlogged((req, res) => res.send(null)),
    (req, res, next) => {
      if (req.query.detailed) {
        loadDetailed(req, res, next);
      } else {
        next();
      }
    },
    (req, res) => res.send(req.user),
  );
};
