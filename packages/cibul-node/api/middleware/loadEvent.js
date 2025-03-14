import logs from '@openagenda/logs';

const log = logs('api/middleware/loadEvent');

const extractIdentifier = (req) =>
  (req.params.eventUid
    ? {
      uid: req.params.eventUid,
    }
    : {
      slug: req.params.eventSlug,
    });

function loadEvent(req, _res, next) {
  if (req.event) {
    return next();
  }
  req.app.services.events
    .get(extractIdentifier(req), {
      private: null,
      access: 'internal',
      throwOnNotFound: true,
    })
    .then((event) => {
      req.event = event;
      log('loaded event', event.slug);
      next();
    }, next);
}

function loadFullEvent(req, _res, next) {
  const { core } = req.app.services;

  core
    .agendas(req.agenda.uid)
    .events.search.get(extractIdentifier(req), {
      detailed: true,
      userUid: req.user?.uid,
    })
    .then((event) => {
      req.event = event;
      log('loaded full event', event.slug);
      next();
    }, next);
}

export default Object.assign(loadEvent, {
  full: loadFullEvent,
});
