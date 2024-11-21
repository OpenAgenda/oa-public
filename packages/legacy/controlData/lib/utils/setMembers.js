import roles from './roles.js';

export default async (ctl, knex, agendaId) => {
  const members = await knex
    .select('uid', 'credential')
    .from('reviewer as rr')
    .leftJoin('user as u', 'rr.user_id', 'u.id')
    .where('rr.review_id', agendaId)
    .whereNotNull('uid');

  members.forEach((m) => {
    ctl[roles[m.credential]].push(m.uid);
  });
};
