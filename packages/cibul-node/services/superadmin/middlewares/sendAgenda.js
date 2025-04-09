export default function sendAgenda(req, res) {
  const { agendas } = req.app.services;

  if (!req.agenda) {
    res.json(null);
    return;
  }

  const credentials = {
    ...Object.entries(agendas.utils.credentials).reduce(
      (accu, [key, value]) => ({
        ...accu,
        [key]: value.default,
      }),
      {},
    ),
    ...req.agenda.credentials,
  };

  res.json({
    ...req.agenda,
    credentials,
    config: {
      credentials: agendas.utils.credentials,
    },
  });
}
