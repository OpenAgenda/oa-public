import _ from 'lodash';

function getFlatLabel(label) {
  return typeof label === 'object' ? label[Object.keys(label)[0]] : label;
}

async function generateSettings(core, agenda) {
  const schema = await core.agendas(agenda.uid).settings.schema.getMerged();

  const tagGroups = schema.fields
    .filter((field) => field.options && (field.origin || 'tags') === 'tags')
    .map((field) => ({
      access: field.read ?? [].length ? 'admin' : 'public',
      name: getFlatLabel(field.label),
      required: !field.optional,
      tags: field.options.map((o) => ({
        label: getFlatLabel(o.label),
        slug: o.value,
        schemaOptionId: `${field.schemaId}.${o.id}`,
      })),
    }));

  const categoryField = schema.fields.find(
    (field) => field.origin === 'categories',
  );

  const customSet = schema.fields
    .filter((f) => f.origin === 'custom')
    .map((f) => ({
      fieldType: f.fieldType,
      label: f.label,
      name: f.field,
      optional: f.optional,
      type: f.read ?? [].length ? 'admin' : 'public',
    }));

  return {
    ..._.pick(agenda, ['title', 'slug', 'description', 'url']),
    embeds: [],
    categorySet: {
      categories:
        categoryField?.options.map((o) => ({
          label: getFlatLabel(o.label),
          slug: o.value,
          schemaOptionId: `${categoryField.schemaId}.${o.id}`,
        })) ?? [],
    },
    customSet,
    tagSet: { groups: tagGroups },
  };
}

export default async function legacySettingsMw(req, res, _next) {
  const { core } = req.app.services;

  res.json(await generateSettings(core, req.agenda));
}

/* export default async function controlDataMw(req, res, _next) {
  const { simpleCache, core } = req.app.services;

  const cachedData = await simpleCache
    .hash('agendas', req.agenda.uid)
    .get('controlData', { json: true });

  if (cachedData) {
    res.json({
      success: true,
      code: 200,
      data: cachedData,
    });
    return;
  }

  const data = await generateControlData(core, req.agenda.uid);

  await simpleCache.hash('agendas', req.agenda.uid).set('controlData', data);

  res.json({
    success: true,
    code: 200,
    data,
  });
}
*/
