function _loadTargetMember(members, { detailed }, req, res, next) {
  members
    .get(
      {
        agendaUid: req.agenda.uid,
        id: req.params.memberId || req.params.id,
      },
      { detailed },
    )
    .then((member) => {
      if (!member) return next(new Error('Member not found'));
      req.targetMember = member;
      next();
    }, next);
}

export default (members, req, res, next) =>
  _loadTargetMember(members, { detailed: false }, req, res, next);

export function options(members, opts) {
  return _loadTargetMember.bind(null, members, opts);
}

export function byEmail(members, req, res, next) {
  members.get
    .byEmail({
      agendaUid: req.agenda.uid,
      email: req.body.email,
    })
    .then((member) => {
      if (!member) return next(new Error('Member not found'));
      req.targetMember = member;
      next();
    }, next);
}
