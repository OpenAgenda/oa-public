import typeis from 'type-is';
import base64 from '@openagenda/utils/base64.js';
import states from '@openagenda/agenda-events/iso/states.js';
import makeLabelGetter from '@openagenda/labels';
import actionLabels from '@openagenda/labels/agendas/actions.js';
import errorLabels from '@openagenda/labels/agendas/errors.js';
import stateLabels from '@openagenda/labels/event/states.js';
import { setFlash } from '../../../lib/flash.js';

const getActionLabel = makeLabelGetter(actionLabels);
const getErrorLabel = makeLabelGetter(errorLabels);
const getStatelabel = makeLabelGetter(stateLabels);

const switches = {
  readytopublished: [states.CONTROLLED, states.PUBLISHED],
  publishedtoready: [states.PUBLISHED, states.CONTROLLED],
  tocontroltoready: [states.TOCONTROL, states.CONTROLLED],
  readytotocontrol: [states.CONTROLLED, states.TOCONTROL],
};

const labels = {
  [states.TOCONTROL]: 'tobecontrolled',
  [states.CONTROLLED]: 'controlled',
  [states.PUBLISHED]: 'published',
};

function doRedirect(req, res) {
  res.redirect(302, `${req.agenda.slug}/admin/events`);
}

export default (req, res, next) => {
  const hasBody = typeis.hasBody(req);
  const state = hasBody ? req.body.state : req.params.state;
  const motive = hasBody ? req.body.motive : null;

  req.app.services.core
    .agendas(req.agenda.uid)
    .events.patch(
      req.event.uid,
      {
        state,
        motive,
      },
      {
        access: req.access,
        private: null,
        context: {
          userUid: req.user.uid,
        },
      },
    )
    .then((result) => {
      if (hasBody) {
        return res.json(result);
      }

      res.redirect(
        302,
        req.query.redirect
          ? base64.decode(req.query.redirect)
          : `/${req.agenda.slug}/events/${req.event.slug}`,
      );
    }, next);
};

export function batched(req, res, next) {
  const stateSwitch = switches[req.body.state];

  if (!stateSwitch) {
    setFlash(res, getErrorLabel('unknownAction', req.lang));

    return doRedirect(req, res);
  }

  req.app.services.core
    .agendas(req.agenda.uid)
    .events.batch(
      'patch',
      {
        state: stateSwitch[0],
      },
      {
        state: stateSwitch[1],
      },
      {
        access: req.access,
        context: {
          userUid: req.user.uid,
        },
      },
    )
    .then(() => {
      req.log.info(
        'changing state of agenda events from %s to %s',
        labels[stateSwitch[0]],
        labels[stateSwitch[1]],
      );

      setFlash(
        res,
        getActionLabel(
          'actionsInProcess',
          {
            oldstate: `<strong>${getStatelabel(labels[stateSwitch[0]], req.lang)}</strong>`,
            newstate: `<strong>${getStatelabel(labels[stateSwitch[1]], req.lang)}</strong>`,
          },
          req.lang,
        ),
      );

      doRedirect(req, res);
    }, next);
}
