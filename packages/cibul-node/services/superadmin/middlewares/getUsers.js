import cmn from '../../../lib/commons-app.js';
import LoadUser from './LoadUser.js';

const loadUserFromQuery = LoadUser();

function _searchUsers(req, res) {
  const { knex } = req.app.services;
  const perPage = 40;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;

  const k = knex('user').where('is_removed', 0);

  if (req.query.search) {
    k.where('email', 'like', `%${req.query.search}%`)
      .orWhere('full_name', 'like', `%${req.query.search}%`)
      .orWhere('uid', req.query.search);
  }

  k.clone()
    .count('id as total')
    .then(([{ total }]) =>
      k
        .select()
        .offset((page - 1) * perPage)
        .limit(perPage)
        .then((rows) => ({
          total,
          users: rows.map(
            ({ uid, full_name: fullName, email, is_removed: isRemoved }) => ({
              uid,
              fullName,
              email,
              isRemoved,
            }),
          ),
          page,
          perPage,
        })))
    .then((response) => cmn.renderJson(req, res, response))
    .catch((err) => {
      cmn.catchError(req, res)(err);
    });
}

export default async function getUsers(req, res, next) {
  const { knex, members: membersSvc, agendas: agendasSvc } = req.app.services;

  if (!req.xhr) {
    return next();
  }

  if (!req.query.uid) {
    return _searchUsers(req, res);
  }

  loadUserFromQuery(req, res, async () => {
    try {
      if (!req.loadedUser?.id) return next(new Error('User not found'));

      let members = await membersSvc.list(
        { userUid: req.loadedUser.uid },
        { limit: 1000, order: 'id.desc' },
        { userOptions: { detailed: true } },
      );

      const { agendas } = await agendasSvc.list(
        { uid: members.map(({ agendaUid }) => agendaUid) },
        0,
        1000,
        { private: null },
      );

      const counters = await knex('agenda_event')
        .select(knex.raw('count(*) as nbrEvents'), 'agenda_uid as agendaUid')
        .where('user_uid', req.loadedUser.uid)
        .where('removed', 0)
        .groupBy('agenda_uid');

      members = members.map((member) => {
        [member.agenda] = agendas.filter(({ uid }) => uid === member.agendaUid);

        const counter = counters.filter(
          ({ agendaUid }) => agendaUid === member.agendaUid,
        )[0];
        member.nbrEvents = counter && counter.nbrEvents;

        return member;
      });

      return cmn.renderJson(req, res, {
        user: req.loadedUser,
        members,
      });
    } catch (err) {
      return next(err);
    }
  });
}
