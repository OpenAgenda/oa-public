import { NotFound, Forbidden } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('api/middleware/getEventFromSearchOrAsDraft');

export default async function getEventFromSearchOrAsDraft(req, res, next) {
  const {
    core,
  } = req.app.services;

  const identifier = {
    ...req.params.eventUid ? {
      uid: req.params.eventUid,
    } : {
      slug: req.params.eventSlug,
    },
  };

  log('getting event matching identifier %j', identifier);

  try {
    req.event = await core
      .agendas(req.agenda.uid)
      .events
      .search.get(identifier, {
        detailed: true,
        userUid: req.user?.uid,
        longDescriptionFormat: req.query.longDescriptionFormat,
        useDateHoursMinutesFormat: req.query.useDateHoursMinutesFormat,
        includeLabels: req.query.includeLabels,
        monolingual: req.query.monolingual,
      });
    return next();
  } catch (err) {
    if (err.name !== 'NotFound') {
      return next(err);
    }

    log('event not found in index, getting draft');

    try {
      const event = await core.agendas(req.agenda.uid).events
        .get(req.params.eventUid, {
          useDateHoursMinutesFormat: req.query.useDateHoursMinutesFormat,
          useLocationObjectFormat: true,
          access: 'internal',
          private: null,
        });

      if (!event?.draft) {
        return next(new NotFound({
          info: identifier,
        }, 'event not found'));
      }

      // only creator can load draft
      if (event.creatorUid !== parseInt(req.user?.uid, 10)) {
        return next(
          new Forbidden('not authorized to read event'),
        );
      }

      req.event = event;

      return next();
    } catch (err2) {
      if (err2.name === 'NotFound') {
        return next(new NotFound({
          info: identifier,
        }, 'event not found'));
      }

      return next(err2);
    }
  }
}
