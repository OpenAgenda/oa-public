import getAndDecorateIndexedEvent from './lib/getAndDecorateIndexedEvent.mjs';

export default app => {
  const {
    sessions,
    members,
    agendas: agendasSvc,
  } = app.services;

  app.get(
    '/agendas/:uid/events/:eventUid/custom',
    agendasSvc.mw.loadBy({ path: 'params.uid', field: 'uid' }),
    sessions.mw.loadOrRedirect(),
    members.mw.load,
    (req, res) => {
      req.app.services.core.agendas(req.agenda.uid).events.get(req.params.eventUid, {
        load: {
          custom: true,
        },
        returnPayload: true,
        access: req.member ? members.utils.getRoleSlug(req.member.role) : 'nobody',
      }).then(result => res.json({
        event: result.event,
        schema: result.formSchema,
      }));
    },
  );

  app.get(
    '/agendas/:uid/events/:eventUid/activities',
    agendasSvc.mw.loadBy({ path: 'params.uid', field: 'uid' }),
    members.mw.load,
    (req, res, next) => {
      getAndDecorateIndexedEvent(req.app.services, {
        agendaUid: req.agenda.uid,
        eventUid: req.params.eventUid,
        userUid: req.user?.uid,
        lang: req.lang,
        originalUrl: req.originalUrl,
      }).then(indexedEvent => {
        if (!indexedEvent) {
          return next({ code: 404 });
        }

        req.event = indexedEvent;

        next();
      }, next);
    },
    (req, res, next) => {
      if (!req.user) {
        return res.json({ count: 0 });
      }

      const {
        activities: activitiesSvc,
      } = req.app.services;

      const limit = 20;

      const feed = activitiesSvc.feed({
        entityType: 'user',
        entityUid: req.user.uid,
      });

      feed.get().then(data => {
        if (!data) return res.json({});

        feed.activities.list(
          { object: `event:${req.event.uid}`/* , target: `agenda:${req.agenda.uid}` */ },
          req.query.fromId || 0,
          limit,
        )

          .then(activities => {
            const lastPage = activities.length < limit;

            res.json({
              activities,
              config: req.query.withConfig ? activitiesSvc.getFormatConfig() : undefined,
              count: activities.length,
              nextUrl: lastPage
                ? null
                : `/agendas/${req.agenda.uid}/events/${req.event.uid}/activities?fromId=${activities[activities.length - 1].id}`,
            });
          })
          .catch(next);
      });
    },
  );
};
