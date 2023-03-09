const getFieldSlug = field => field.slug ?? field.field;
const getPath = (parentPath, slug) => ((parentPath ?? '').length ? `${parentPath}.${slug}` : slug);

const extractLanguages = label => (typeof label === 'string' || !label ? [] : Object.keys(label));
const uniq = items => items.reduce((deduped, item) => (deduped.includes(item) ? deduped : deduped.concat(item)), []);

const getLabel = (label, lang) => {
  if (!label) return label;
  if (typeof label === 'string') return label;
  if (label[lang]) return label[lang];
  return label[Object.keys(label).shift()];
};

const getMergedLabel = (fieldLabel, parentLabel) => {
  if (fieldLabel === undefined) {
    return fieldLabel;
  }

  if ((typeof fieldLabel === 'string') && (typeof parentLabel === 'string')) {
    return [parentLabel, fieldLabel].join(': ');
  }

  return uniq(
    extractLanguages(fieldLabel).concat(extractLanguages(parentLabel)),
  ).reduce((label, lang) => ({
    ...label,
    [lang]: getMergedLabel(getLabel(fieldLabel, lang), getLabel(parentLabel, lang)),
  }), {});
};

function getFlattenedSchemaFields(schema, options = {}) {
  const {
    path,
    prefixedLabels,
    parent,
  } = options;

  return schema.fields.reduce((fields, field) => {
    const fieldPath = getPath(path, getFieldSlug(field));

    if (field.schema) {
      return fields.concat(getFlattenedSchemaFields(field.schema, {
        ...options,
        parent: field,
        path: getPath(path, fieldPath),
      }));
    }
    const flattenedField = {
      ...field,
      field: fieldPath,
    };

    const label = prefixedLabels && parent ? getMergedLabel(field.label, parent.label) : field.label;

    if (label) {
      flattenedField.label = label;
    }

    fields.push(flattenedField);
    return fields;
  }, []);
}

export default function getFlattenedSchema(schema, options = {}) {
  const params = {
    path: '',
    prefixedLabels: false,
    parent: null,
  };
  if (typeof options === 'string') {
    params.path = options;
  } else {
    Object.assign(params, options);
  }

  return {
    ...schema,
    fields: getFlattenedSchemaFields(schema, options),
  };
}
