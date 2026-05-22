import _ from 'lodash';
import range from '@openagenda/date-range';
import listMw from '../services/activities/middleware/list.js';
import cmn from '../lib/commons-app.js';
import { requireUserJson } from '../lib/authGuards.js';

const LIST_LIMIT = 20;

function getBooleanQuery(param) {
  if (param === '0' || param === 'false') return false;
  if (param === '1' || param === 'true') return true;
}

async function agendasList(req, res, next) {
  const { agendas: agendasSvc, members: membersSvc } = req.app.services;

  const page = req.query.page || 1;
  const offset = (page - 1) * LIST_LIMIT;

  try {
    const { total, agendas } = await agendasSvc.list(
      {
        memberUserUid: req.user.uid,
        search: req.query.search,
      },
      offset,
      LIST_LIMIT,
      {
        includeImagePath: getBooleanQuery(req.query.includeImagePath) ?? true,
        useDefaultImage: getBooleanQuery(req.query.useDefaultImage) ?? true,
        private: null,
        total: true,
        includeFields: ['settings', 'credentials'],
      },
    );

    const members = await membersSvc.list(
      {
        userUid: req.user.uid,
        agendaUid: agendas.map((s) => s.uid),
        ...req.query.role ? { role: req.query.role } : {},
      },
      { offset: 0, limit: LIST_LIMIT },
    );

    res.send({
      total,
      agendas: agendas.map((agenda) =>
        _.assign(_.omit(agenda, ['credentials']), {
          member: members.find((s) => s.agendaUid === agenda.uid),
          mailto: cmn.agendaMailTo(agenda),
        })),
    });
  } catch (e) {
    next(e);
  }
}

function eventsList(req, res, next) {
  const { events: eventsSvc } = req.app.services;

  const offset = ((req.query.page || 1) - 1) * LIST_LIMIT;

  req.log.debug('fetching events owned by user %s', req.user.uid);

  eventsSvc
    .list(
      {
        ownerUid: req.user.uid,
        search: req.query.search,
      },
      {
        offset,
        limit: LIST_LIMIT,
        order: 'updatedAt.desc',
      },
      {
        total: true,
        detailed: true,
        useDefaultImage: true,
        draft: null,
        private: null,
      },
    )
    .then(({ total, items }) => {
      req.log.debug(
        'fetched %s of %s events owned by user %s',
        items.length,
        total,
        req.user.uid,
      );

      res.send({
        total,
        events: items.map((event) => {
          const timings = (event.timings || []).map((t) => ({
            start: new Date(t.begin),
            end: new Date(t.end),
          }));
          return {
            ...event,
            timings,
            timerange: range(
              timings,
              req.lang || 'fr',
              event.timezone || 'Europe/Paris',
            ),
          };
        }),
      });
    }, next);
}

export default (app) => {
  const { activities } = app.services;

  const preMw = [cmn.loadLogger('home'), requireUserJson];

  app.get('/home/agendas', preMw, agendasList);

  app.get('/home/events.json', preMw, eventsList);

  app.get('/home/activities/list', preMw, (req, res) =>
    listMw(activities, { entityType: 'user', entityUid: req.user.uid })(
      req,
      res,
    ));
};
