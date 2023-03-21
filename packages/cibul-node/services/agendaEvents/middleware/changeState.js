'use strict';

const typeis = require('type-is');
const base64 = require('@openagenda/utils/base64');
const states = require('@openagenda/agenda-events/iso/states');
const sessions = require('../../sessions');

const actionLabels = require('@openagenda/labels')(
  require('@openagenda/labels/agendas/actions')
);
const errorLabels = require('@openagenda/labels')(
  require('@openagenda/labels/agendas/errors')
);
const stateLabels = require('@openagenda/labels')(
  require('@openagenda/labels/event/states')
);

const switches = {
  readytopublished: [states.CONTROLLED, states.PUBLISHED],
  publishedtoready: [states.PUBLISHED, states.CONTROLLED],
  tocontroltoready: [states.TOCONTROL, states.CONTROLLED],
  readytotocontrol: [states.CONTROLLED, states.TOCONTROL]
};

const labels = {
  [states.TOCONTROL]: 'tobecontrolled',
  [states.CONTROLLED]: 'controlled',
  [states.PUBLISHED]: 'published'
};

module.exports = (req, res, next) => {
  const hasBody = typeis.hasBody(req);
  const state = hasBody
    ? req.body.state
    : req.params.state;

  req.app.services.core.agendas(req.agenda.uid).events.update(req.event.uid, {
    state
  }, {
    partial: true,
    access: req.access,
    private: null,
    context: {
      userUid: req.user.uid
    }
  }).then(result => {
    if (hasBody) {
      return res.json(result);
    }

    res.redirect(
      302,
      req.query.redirect ? base64.decode(req.query.redirect) : `/${req.agenda.slug}/events/${req.event.slug}`
    );
  }, next);
}

module.exports.batched = (req, res, next) => {
  const stateSwitch = switches[req.body.state];

  if (!stateSwitch) {
    sessions.setFlash(req, res, errorLabels('unknownAction', req.lang));

    return _redirect(req, res);
  }

  req.app.services.core.agendas(req.agenda.uid).events.batch('update', {
    state: stateSwitch[0]
  }, {
    state: stateSwitch[1]
  }, {
    partial: true,
    access: req.access,
    context: {
      userUid: req.user.uid
    }
  }).then(() => {
    req.log.info('changing state of agenda events from %s to %s', labels[stateSwitch[0]], labels[stateSwitch[1]]);

    sessions.setFlash(req, res, actionLabels('actionsInProcess', {
      oldstate : '<strong>' + stateLabels(labels[stateSwitch[0]], req.lang) + '</strong>',
      newstate : '<strong>' + stateLabels(labels[stateSwitch[1]], req.lang) + '</strong>'
    }, req.lang));

    _redirect(req, res);
  }, next);
}

function _redirect(req, res) {
  res.redirect(302, `${req.agenda.slug}/admin/events`);
}
