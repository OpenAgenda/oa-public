import ih from 'immutability-helper';

function _list(members, req, query = {}, order = null) {
  return members.list(
    ih(query, {
      agendaUid: { $set: req.agenda.uid },
      deletedUser: { $set: null },
    }),
    { ...query, order },
    {
      detailed: true,
      total: true,
    },
  );
}

export default async (members, req, res, _next) => {
  res.json(await _list(members, req, req.query, req.order));
};

export async function stats(members, req, res, _next) {
  _list(members, req, { limit: 0 }).then(({ totalPerRole, total }) =>
    res.json({
      totalPerRole,
      total,
    }));
}
