import convert from '@openagenda/legacy/convertLegacyFilter/index.js';

export default async (req, res, next) => {
  const {
    legacy: {
      tagsAndCustom,
    },
  } = req.app.services;
  const { query } = req;

  if (!Object.keys(query).includes('oaq')) {
    req.convertedQuery = query;
    return next();
  }

  let tagSet;
  let categorySet;
  if (Object.keys(query.oaq).includes('tags')) tagSet = await tagsAndCustom.getTagSet(req.agenda.uid);
  if (Object.keys(query.oaq).includes('category')) categorySet = await tagsAndCustom.getCategorySet(req.agenda.uid);

  const formSchema = await req.app.core.agendas(req.agenda.uid).settings.get({ access: 'internal' });

  req.convertedQuery = { ...convert(query.oaq, { formSchema, tagSet, categorySet }), ...query };
  delete req.convertedQuery.oaq;

  next();
};
