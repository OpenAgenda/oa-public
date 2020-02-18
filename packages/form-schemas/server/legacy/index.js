'use strict';

const _ = require('lodash');
const VError = require('verror');

const parseCustomFields = require('./parseCustomFields');
const parseTagSet = require('./parseTagSet');

module.exports = ({ client, schemas, service }) => {
  return {
    get: get.bind(null, { client, schema }),
    transfer: transfer.bind(null, { client, schema, service }),
  }
}

async function get({ client, schemas }, agendaId) {
  let tagSet;
  let categorySet;
  let formData = {
    fields: []
  };

  const networkUid = await client('review')
    .first('network_uid')
    .where('id', agendaId)
    .then(r => r ? r.network_uid : null);

  const networkFormSchemaId = networkUid ? await client(schemas.network)
    .first('form_schema_id')
    .where('uid', networkUid)
    .then(r => r ? r.form_schema_id : null) : null;

  const networkFormSchema = networkFormSchemaId ? await client(schemas.formSchema)
    .first('store')
    .where('id', networkFormSchemaId)
    .then(r => r && r.store ? JSON.parse(r.store) : null) : null;

  try {
    const customFields = await _queryStore(client, 'review', agendaId, 'customFields');
    if (customFields) {
      formData = parseCustomFields(formData, customFields);
    }
  } catch(e) {
    throw new VError(e, 'could not parse legacy custom fields for agenda of id %s', agendaId);
  }

  try {
    const tagSet = await _queryStore(client, 'tag_set', agendaId );
    if (tagSet) {
      formData = parseTagSet(formData, tagSet);
    }
  } catch(e) {
    throw new VError(e, 'could not parse legacy tag set for agenda of id %s', agendaId);
  }

  try {
    const categorySet = await _queryStore(client, 'category_set', agendaId);
    if (categorySet && categorySet.categories.length) {
      formData = parseTagSet.categories(formData, categorySet);
    }
  } catch(e) {
    throw new VError(e, 'could not parse legacy category set for agenda of id %s', agendaId);
  }

  if (networkFormSchema) {
    formData.fields.forEach((f, i) => {
      formData.fields[i].network = networkFormSchema.fields.map(f => f.field).indexOf(f.field) !== -1
    });
  }

  return formData.fields.length ? formData : null;
}

async function transfer({ client, schemas, service }, agendaId) {
  const agenda = await client('review').first([
    'form_schema_id'
  ]).where('id', agendaId);

  if (!agenda) {
    return {
      transfered: false,
      message: 'agenda not found',
      agendaId
    }
  }

  const operation = agenda['form_schema_id'] ? 'update' : 'create';

  const formSchema = await get({ client, schemas }, agendaId);

  if (formSchema) {
    formSchema.fields = formSchema.fields.filter(f => !f.network);
  }

  const result = operation === 'update'
    ? await service.update(agenda['form_schema_id'], formSchema)
    : await service.create(formSchema);

  if (result.success && operation === 'create') {
    await client('review').update({
      form_schema_id: result.id
    }).where('id', agendaId);
  }

  return {
    transfered: true,
    operation,
    ...result
  };
}

function _queryStore(client, schema, id, key) {
  return client(schema)
    .first('store')
    .where({ id })
    .then(r => r && r.store ? JSON.parse(storeString) : null)
    .then(store => store && key ? store[key] : store);
}
