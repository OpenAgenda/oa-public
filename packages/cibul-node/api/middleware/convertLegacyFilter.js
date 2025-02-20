import convert from '@openagenda/legacy/convertLegacyFilter/index.js';

import legacySettings from '../../lib/legacySettings.js';

export default async (req, res, next) => {
  const { query } = req;

  if (!Object.keys(query).includes('oaq')) {
    req.convertedQuery = query;
    return next();
  }

  const formSchema = await req.app.core
    .agendas(req.agenda.uid)
    .settings.schema.getMerged({ access: 'internal' });

  const { tagSet, categorySet } = legacySettings.generate(formSchema);

  req.convertedQuery = {
    ...convert(query.oaq, { formSchema, tagSet, categorySet }),
    ...query,
  };
  delete req.convertedQuery.oaq;

  next();
};
