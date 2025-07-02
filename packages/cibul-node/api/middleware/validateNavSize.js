import { BadRequest } from '@openagenda/verror';

export default function validateNavSize(req, res, next) {
  const { core } = req.app.services;

  const { enforceAPISizeLimitAgendaExclusionList = [] } = core.getConfig();

  if (enforceAPISizeLimitAgendaExclusionList.includes(req.agenda.uid)) {
    return next();
  }

  for (const key of ['size', 'limit']) {
    if (req.query[key] === undefined) {
      continue;
    }

    const value = parseInt(req.query[key], 10);

    if (Number.isNaN(value)) {
      return next(new BadRequest(`${key} must be an integer`));
    }

    if (value > 300) {
      return next(new BadRequest(`${key} must not exceed 300`));
    }
  }
  next();
}
