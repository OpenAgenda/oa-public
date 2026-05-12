import logs from '@openagenda/logs';

const log = logs('utils/updateDynamicSettings');

export default async function updateDynamicSettings(
  { client },
  index,
  settings,
) {
  const { body } = await client.indices.getSettings({ index });
  const {
    settings: { index: current },
  } = Object.values(body)[0];

  const modifiedSettings = Object.keys(settings).reduce((changes, key) => {
    if (settings[key] === parseInt(current[key], 10)) {
      return changes;
    }
    return {
      ...changes,
      [key]: settings[key],
    };
  }, {});

  if (Object.keys(modifiedSettings).length === 0) {
    log.info('no settings change, no need to update');
    return null;
  }

  log.info('applying %j on %j', modifiedSettings, current);

  return client.indices.putSettings({
    index,
    body: modifiedSettings,
  });
}
