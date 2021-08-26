function _isLeaf(node) {
  let is = false;

  if (node && node.type && typeof node.type !== 'object' && node.type !== 'schema') {
    is = true;
  } else {
    is = !Object.keys(node || {}).filter(k => (
      (typeof node[k] === 'object' && node[k] !== null)
    )).length;
  }
  return is;
}

function _isNormalized(schema) {
  if (schema.fields) return true;

  return false;
}

export default function clean(schema) {
  if (_isLeaf(schema)) {
    return { ...schema };
  }

  const cleanSchema = {
    fields: {},
    list: false,
    type: 'schema'
  };

  let schemaFields;

  if (_isNormalized(schema)) {
    Object.assign(cleanSchema, schema);

    schemaFields = schema.fields;
  } else {
    schemaFields = schema;
  }

  Object.keys(schemaFields).forEach(branchKey => {
    cleanSchema.fields[branchKey] = clean(schemaFields[branchKey]);
  });

  return cleanSchema;
}
