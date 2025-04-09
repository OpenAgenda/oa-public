import logs from '@openagenda/logs';
import validators from '@openagenda/validators';

const log = logs('services/superadmin/middlewares/searchMembers');

export default async function searchMembers(req, res, next) {
  const { members: membersSvc } = req.app.services;

  const limit = 20;
  let page = 1;
  let offset = 0;

  try {
    page = validators.number({
      min: 1,
      default: 1,
    })(req.query.membersPage);

    offset = (page - 1) * limit;
  } catch (error) {
    log.error('member search failed', { error });
  }

  // bad practice to call a service inside another service
  try {
    const { total, members } = await membersSvc.list(
      {
        agendaUid: parseInt(req.query.agendaUid, 10),
        deletedUser: null,
      },
      { order: 'role.desc', offset, limit },
      { total: true, detailed: true, userOptions: { detailed: true } },
    );

    res.json({
      members,
      total,
    });
  } catch (e) {
    return next(e);
  }
}
