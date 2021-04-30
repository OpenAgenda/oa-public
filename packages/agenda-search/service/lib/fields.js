'use strict';

const fields = [{
  field: 'image',
  access: ['public', 'internal', 'administrator', 'moderator']
}, {
  field: 'uid',
  access: ['public', 'internal', 'administrator', 'moderator']
}, {
  field: 'description',
  access: ['public', 'internal', 'administrator', 'moderator']
}, {
  field: 'official',
  access: ['public', 'internal', 'administrator', 'moderator']
}, {
  field: 'title',
  access: ['public', 'internal', 'administrator', 'moderator']
}, {
  field: 'slug',
  access: ['public', 'internal', 'administrator', 'moderator']
}, {
  field: 'summary',
  fields: [{
    field: 'keywords',
    access: ['public', 'internal', 'administrator', 'moderator'],
    detailed: true
  }, {
    field: 'recentlyAddedEvents',
    access: ['public', 'internal', 'administrator', 'moderator'],
    detailed: true
  }, {
    field: 'publishedEvents',
    access: ['public', 'internal', 'administrator', 'moderator'],
    detailed: true
  }, {
    field: 'eventCountsByState',
    access: ['internal', 'administrator', 'moderator'],
    detailed: true
  }]
}, {
  field: 'schema',
  access: ['public', 'internal', 'administrator', 'moderator'],
  detailed: true
}, {
  field: 'createdAt',
  access: ['public', 'internal', 'administrator', 'moderator'],
  detailed: true
}, {
  field: 'network',
  access: ['public', 'internal', 'administrator', 'moderator'],
  detailed: true
}, {
  field: 'locationSet',
  access: ['public', 'internal', 'administrator', 'moderator'],
  detailed: true
}, {
  field: 'settings',
  access: ['public', 'internal', 'administrator', 'moderator'],
  detailed: true
}, {
  field: 'indexed',
  access: ['internal'],
  detailed: true
}];

const pathIsInRequestedFields = (fields = [], path = []) => path?.length && fields.includes(path.join('.'));

const addField = (includes, field, { path }) => includes.concat(
  (path || []).concat(field.field).join('.')
);

function buildPaths(fields, options = {}) {
  const path = options.path || [];
  return fields.reduce((paths, field) => {
    paths.push(path.concat(field.field).join('.'));
    if (field.fields) {
      return paths.concat(buildPaths(field.fields, { path: path.concat(field.field) }));
    }
    return paths;
  }, []);
}

function defineIncludes(fields, options = {}) {
  return fields.reduce((includes, field) => {
    if (field.fields) {
      return includes.concat(defineIncludes(field.fields, {
        ...options,
        path: (options.path || []).concat(field.field)
      }));
    }

    if (!field.access.includes(options.access || 'public')) {
      return includes;
    }

    if (pathIsInRequestedFields(options.onlyIncludeFields, options.path)) {
      return addField(includes, field, options);
    } else if (options.onlyIncludeFields?.length && options.onlyIncludeFields.includes(field.field)) {
      return addField(includes, field, options);
    } else if (options.onlyIncludeFields?.length) {
      return includes;
    }

    if (options.detailed && field.detailed) {
      return addField(includes, field, options);
    } else if (!field.detailed) {
      return addField(includes, field, options);
    }

    if (pathIsInRequestedFields(options.includeFields, options.path)) {
      return addField(includes, field, options);
    } else if (options.includeFields?.length && options.includeFields.includes(field.field)) {
      return addField(includes, field, options);
    }

    return includes;
  }, []);
}


module.exports.defineIncludes = options => defineIncludes(fields, options);

module.exports.paths = buildPaths(fields);