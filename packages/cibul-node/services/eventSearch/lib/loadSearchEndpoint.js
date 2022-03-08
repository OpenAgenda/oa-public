'use strict';

const convert = require('@openagenda/legacy/convertLegacyFilter');

const mapIncludeFields = includeFields => {
  if (includeFields && includeFields.includes('permalink')) {
    const requestedFields = [...includeFields];
    requestedFields[includeFields.indexOf('permalink')] = 'uid';
    return requestedFields;
  }
  return includeFields;
};

module.exports = core => async (req, res, next) => {
  req.search = core
    .agendas(req.params.agendaUid)
    .events.search;

  const { includeFields, distributeOptionalFields } = req.query;
  if (distributeOptionalFields) includeFields.push(...distributeOptionalFields);

  req.searchOptions = {
    ...req.query,
    includeFields: mapIncludeFields(includeFields),
    stream: false,
    detailed: true,
    access: req.access ?? 'public'
  };

  req.searchQuery = {
    ...req.query
  };

  const {
    legacy: {
      tagsAndCustom
    }
  } = req.app.services;

  if (Object.keys(req.searchQuery).includes('oaq')) {
    let tagSet;
    let categorySet;

    if (Object.keys(req.searchQuery.oaq).includes('tags')) tagSet = await tagsAndCustom.getTagSet(req.params.agendaUid);
    if (Object.keys(req.searchQuery.oaq).includes('category')) categorySet = await tagsAndCustom.getCategorySet(req.params.agendaUid);

    const formSchema = await req.app.core.agendas(req.params.agendaUid).settings.get({ access: 'internal' });

    req.searchQuery = { ...convert(req.searchQuery.oaq, { formSchema, tagSet, categorySet }), ...req.searchQuery };
    delete req.searchQuery.oaq;
  }

  delete req.searchQuery.state;

  if (req.user?.uid) {
    req.searchOptions.userUid = req.user.uid;
    req.searchQuery.state = req.query.state === undefined ? null : req.query.state;
  }

  next();
};
