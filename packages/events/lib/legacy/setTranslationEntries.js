import logs from '@openagenda/logs';

const log = logs('legacy/setTranslationEntries');

const setTranslationEntry = async (client, table, id, data) => {
  if (!await client(table).first('id').where({ id, lang: data.lang })) {
    log('inserting %s reference for id %s', table, id);
    return client(table).insert({
      ...data,
      id,
    });
  }
  log('updating %s reference for id %s', table, id);
  return client(table).update(data).where({
    id,
    lang: data.lang,
  });
};

const setTranslationEntries = async (client, table, id, data) => {
  const editedLangs = [];

  for (const translationEntry of data[table]) {
    await setTranslationEntry(client, table, id, translationEntry);
    editedLangs.push(translationEntry.lang);
  }

  const deleteResult = await client(table)
    .delete()
    .where('id', id)
    .whereNotIn('lang', editedLangs);

  log('deleted %s %s references', deleteResult, table);
};

export default setTranslationEntries;
