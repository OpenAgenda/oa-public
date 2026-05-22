import { requireUser } from '../lib/authGuards.js';

export default (app) => {
  const { members, agendas: agendasSvc } = app.services;

  app.get(
    '/agendas/:uid/events/:eventUid/custom',
    agendasSvc.mw.loadBy({ path: 'params.uid', field: 'uid' }),
    requireUser,
    members.mw.load,
    (req, res) => {
      req.app.services.core
        .agendas(req.agenda.uid)
        .events.get(req.params.eventUid, {
          load: {
            default: false,
            custom: true,
          },
          returnPayload: true,
          access: req.member
            ? members.utils.getRoleSlug(req.member.role)
            : 'nobody',
        })
        .then((result) =>
          res.json({
            event: result.event,
            schema: result.formSchema,
          }));
    },
  );
};
