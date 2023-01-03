'use strict';

const getFieldSlug = field => field.slug ?? field.field;
const getPath = (parentPath, slug) => ((parentPath ?? '').length ? `${parentPath}.${slug}` : slug);

module.exports = function getFlattenedFieldSlugs(schema, path = '') {
  return schema.fields.reduce((slugs, field) => {
    const fieldPath = getPath(path, getFieldSlug(field));
    if (field.schema) {
      return slugs.concat(getFlattenedFieldSlugs(field.schema, getPath(path, fieldPath)));
    }
    slugs.push(fieldPath);
    return slugs;
  }, []);
};
