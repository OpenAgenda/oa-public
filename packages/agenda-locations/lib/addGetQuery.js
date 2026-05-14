export default async (service, k, deleted, query) => {
  const cleanQuery = { ...query };

  const { setUid, agendaUid, uid, extId, slug } = cleanQuery;

  const agendaId = agendaUid
    ? await service.interfaces
      .getAgendaDetailsByUid(agendaUid, ['id'])
      .then((r) => (r ? r.id : null))
    : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  if (setUid) {
    k.where('set_uid', setUid);
  }

  if (extId) {
    k.whereRaw(
      "? MEMBER OF (ext_ids->'$.identifiers')",
      `${extId.key}->${extId.value}`,
    );
  } else if (slug) {
    k.where('slug', slug);
  } else {
    k.where('uid', uid);
  }

  if (deleted === true) {
    k.where('deleted', 1);
  }
  if (deleted === false) {
    k.where('deleted', '<>', 1);
  }
};
