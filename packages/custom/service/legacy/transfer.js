import _ from 'lodash';
import logs from '@openagenda/logs';
import serviceCreate from '../create.js';
import serviceUpdate from '../update.js';
import serviceGet from '../get.js';
import serviceRemove from '../remove.js';
import load from './load.js';
import serviceCategories from './categories.js';
import serviceCustom from './custom.js';
import serviceTags from './tags.js';

const log = logs('legacy/transfer');

const libs = {
  categories: serviceCategories,
  custom: serviceCustom,
  tags: serviceTags,
};

function parse(fields, { custom, tags, category }) {
  return _.assign(
    libs.custom.parse(
      fields.filter((f) => f.origin === 'custom'),
      custom,
    ),
    libs.tags.parse(
      fields.filter((f) => f.origin === 'tags'),
      tags,
    ),
    libs.categories.parse(
      fields.filter((f) => f.origin === 'categories'),
      category,
    ),
  );
}

async function transfer(formSchemaId, identifier, defaultAgendaId = null) {
  log('info', 'transfering event %s legacy to %s', identifier, formSchemaId);

  const {
    // agendaId,
    fields,
    // eventId,
    agendaEventId,
    custom,
    categoryId,
  } = await load(formSchemaId, identifier, { agendaId: defaultAgendaId });

  const legacyTags = await libs.tags.load(agendaEventId);

  const legacyCategory = await libs.categories.load(categoryId);

  const toTransfer = parse(fields, {
    custom,
    tags: legacyTags,
    category: legacyCategory,
  });

  const emptyLegacyCustom = !_.keys(toTransfer).length;
  const current = await serviceGet(formSchemaId, identifier);

  if (emptyLegacyCustom && current) {
    log('info', 'removing custom %s.%s', formSchemaId, identifier);

    await serviceRemove(formSchemaId, identifier);
  } else if (emptyLegacyCustom && !current) {
    log('info', 'no custom values to transfer');
  } else if (current) {
    log('info', 'updating custom %s.%s', formSchemaId, identifier);

    await serviceUpdate(formSchemaId, identifier, toTransfer, {
      draft: true,
    });
  } else {
    log(
      'info',
      'creating custom %s.%s: %j',
      formSchemaId,
      identifier,
      toTransfer,
    );

    const result = await serviceCreate(formSchemaId, identifier, toTransfer, {
      draft: true,
    });

    if (!_.get(result, 'success')) {
      log(
        'warn',
        'could not transfer custom %s.%s: %j',
        formSchemaId,
        identifier,
        result,
      );
    }
  }
}

export default _.assign(transfer, {
  parse,
});
