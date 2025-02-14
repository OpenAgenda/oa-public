import _ from 'lodash';

function getFlatLabel(label) {
  return typeof label === 'object' ? label[Object.keys(label)[0]] : label;
}

function generate(schema) {
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

async function middleware(req, res, _next) {
  const { core } = req.app.services;

  res.json({
    ..._.pick(req.agenda, ['title', 'slug', 'description', 'url']),
    ...generate(await core.agendas(req.agenda.uid).settings.schema.getMerged()),
  });
}

export default {
  middleware,
  generate,
};
