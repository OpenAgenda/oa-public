import { loadOptionals, render } from './utils.js';

export const renderInvalidActivation = render('auth/invalidActivation', {});

export function layoutData(req) {
  return {
    optionals: loadOptionals(req),
    agenda: req.agenda ? req.agenda : false,
  };
}
