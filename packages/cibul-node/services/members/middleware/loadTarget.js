'use strict';

function _loadTargetMember(members, { detailed }, req, res, next) {
  members.get({
    agendaUid: req.agenda.uid,
    id: req.params.memberId || req.params.id,
  }, { detailed }).then(member => {
    if (!member) return next(new Error('Member not found'));
    req.targetMember = member;
    next();
  }, next);
}

module.exports = (members, req, res, next) => _loadTargetMember(members, { detailed: false }, req, res, next);

module.exports.options = (members, options) => _loadTargetMember.bind(null, members, options);

module.exports.byEmail = (members, req, res, next) => {
  members.get.byEmail({
    agendaUid: req.agenda.uid,
    email: req.body.email,
  }).then(member => {
    if (!member) return next(new Error('Member not found'));
    req.targetMember = member;
    next();
  }, next);
};
