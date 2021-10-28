'use strict';

const convert = require('@openagenda/legacy/convertLegacyFilter');

module.exports = async (req, res, next) => {
  const {
    legacy: {
      tagsAndCustom
    }
  } = req.app.services;

  if (!Object.keys(req.query).includes('oaq')) {
    req.convertedQuery = req.query;
    return next();
  }

  let tagSet;
  let categorySet;
  if (Object.keys(req.query.oaq).includes('tags')) tagSet = await tagsAndCustom.getTagSet(req.agenda.uid);
  if (Object.keys(req.query.oaq).includes('category')) categorySet = await tagsAndCustom.getCategorySet(req.agenda.uid);

  const formSchema = await req.app.core.agendas(req.agenda.uid).settings.get({ access: 'internal' });

  req.convertedQuery = convert(req.query.oaq, { formSchema, tagSet, categorySet });

  next();
};
