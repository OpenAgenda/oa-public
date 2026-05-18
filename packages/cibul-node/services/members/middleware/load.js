import _ from 'lodash';
import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/members/index.js';
import logs from '@openagenda/logs';
import { setFlash } from '../../../lib/flash.js';

const log = logs('services/members/middleware/loadMember');
const getLabel = makeLabelGetter(labels);

async function _load({ agendaUidPath }, req) {
  const { members } = req.app.services;
  const agendaUid = _.get(req, agendaUidPath || 'agenda.uid');

  if (!req.user) {
    return;
  }

  const member = await members.get({
    agendaUid,
    userUid: req.user.uid,
  });

  req.access = member && members.utils.getRoleSlug(member.role);
  req.member = member;
}

export default (req, res, next) => {
  log('loading current user member reference');
  _load({ agendaUidPath: 'agenda.uid' }, req).then(next, next);
};

export function andAuthorize(requiredRole, options = {}) {
  const orFn = _.get(options, 'or', (req, res) => {
    if (!req.member) {
      setFlash(res, getLabel('memberRequired', req.lang));
      res.redirect(302, `/${req.agenda.slug}`);
    } else {
      setFlash(res, getLabel('roleInsufficient', req.lang));
      res.redirect(302, `/${req.agenda.slug}`);
    }
  });

  return (req, res, next) => {
    log('load and authorize', requiredRole);

    const { members } = req.app.services;
    const { isSuperiorToOrEqual } = members.utils.compareRoles;

    _load(options, req).then(() => {
      if (req.member && isSuperiorToOrEqual(req.member.role, requiredRole)) {
        next();
      } else {
        orFn(req, res, next);
      }
    }, next);
  };
}

export function or(orFn) {
  return (req, res, next) => {
    _load({ agendaUidPath: 'agenda.uid' }, req).then(() => {
      if (!req.member) return orFn(req, res, next);
      next();
    }, next);
  };
}

export function orFail(req, res, next) {
  log('loading current user member reference... or fail');
  _load({ agendaUidPath: 'agenda.uid' }, req).then(() => {
    if (!req.member) {
      res.status(403);
      return next(new Error('Not a member'));
    }
    next();
  }, next);
}
