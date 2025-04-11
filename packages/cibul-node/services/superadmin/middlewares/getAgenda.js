export default function getAgenda(req, _res, next) {
  const { core } = req.app.services;
  core
    .agendas(req.params.uid)
    .get({
      private: null,
      throwNotFound: true,
      access: 'internal',
      detailed: true,
    })
    .then((agenda) => {
      req.agenda = agenda;
      next();
    }, next);
}
