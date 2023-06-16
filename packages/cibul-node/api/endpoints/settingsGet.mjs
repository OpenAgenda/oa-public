export default async (req, res, next) => res.json({
  form: await req.app.services.core
    .agendas(req.agenda.uid).settings.get({ access: 'internal' })
    .then(r => r.fields, next),
});
