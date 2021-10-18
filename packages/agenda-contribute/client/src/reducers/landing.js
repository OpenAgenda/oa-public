import debug from 'debug';
import isMemberValid from '../lib/isMemberValid';

const log = debug('landing');

/**
 * define which screen should be shown
 */
// state = initialState, action
function evaluate(history, step, requested = false) {
  return ({ getState }) => {
    const state = getState();

    const {
      base,
      member: memberConfig,
      mode,
      draft
    } = state.config;

    log('evaluating mode %s on step %s with a %s event', mode, step, draft ? 'draft' : 'non draft');

    if (['edit', 'add'].includes(mode) && !draft) {
      if (mode === step) {
        log('landing in %s step', step);
        return;
      }
      const historyUpdate = mode === 'edit'
        ? `${base}/event/${state.event.uid}`
        : `${base}/event/${state.event.uid}/from/${state.config.fromAgenda.uid}`;

      log('updating history to %s', historyUpdate);

      return history.replace(historyUpdate);
    }

    // we are handling a new or a draft event

    const requestedRoute = `${base}/${step}${step === 'event' && draft ? `/${state?.event?.uid}/draft` : ''}`;

    const authorizedRoutes = [`${base}/member`];

    if (!memberConfig.dataIsRequired || isMemberValid(memberConfig.schema, state.member) || state?.member?.role === 'administrator') {
      authorizedRoutes.push(base + (
        draft ? `/event/${state?.event?.uid}/draft` : '/event'
      ));
    }

    if (state?.event?.uid && step === 'confirmation') {
      authorizedRoutes.push(`${base}/confirmation`);
    }

    log('requested %s vs authorized %s', requestedRoute, authorizedRoutes.join(', '));

    if (!step || !authorizedRoutes.includes(requestedRoute)) {
      history.replace(authorizedRoutes.pop());
    } else if (requested) {
      history.replace(requestedRoute);
    }
  };
}

export default Object.assign((state = {}) => state, {
  evaluate
});
