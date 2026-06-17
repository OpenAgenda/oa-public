import _ from 'lodash';
import ih from 'immutability-helper';
import { scrubDefaultValue } from './fieldOptions.js';

const getIsAbstract = ({ fieldType, type }) => {
  if (type === 'abstract') {
    return true;
  }
  return (fieldType ?? 'abstract') === 'abstract';
};

const assignSchemaValuesToNonAbstractFields = (schema) => ({
  custom: schema?.custom || {},
  fields: (schema?.fields || []).map((f) => {
    const isAbstract = getIsAbstract(f);
    return {
      ...f,
      schemaId: isAbstract ? null : schema.id || null,
      schemaType: isAbstract ? null : schema.type || null,
    };
  }),
});

function mergeRelated(relateds) {
  return relateds
    .map((related) => (Array.isArray(related) ? { other: related } : related))
    .reduce((merged, related) => {
      if (!related) {
        return merged;
      }
      Object.keys(related).forEach((relatedKey) => {
        merged[relatedKey] = _.uniq(merged[relatedKey] ?? []).concat(
          related[relatedKey],
        );
      });

      return merged;
    }, {});
}

function mergeField(field, mergeWithField) {
  if (!mergeWithField) return field;

  const protectedKeys = ['field', 'fieldType', 'origin', 'type', 'slug'];

  const update = _.keys(mergeWithField)
    .filter((k) => !protectedKeys.includes(k))
    .filter((f) => mergeWithField[f] !== undefined)
    .reduce((c, f) => _.set(c, f, { $set: mergeWithField[f] }), {});

  if (field.optional && mergeWithField.optional === false) {
    update.optional = { $set: false };
  }

  if (_.get(mergeWithField, 'allowedOptions')) {
    update.options = {
      $set: _.get(field, 'options').filter((o) =>
        mergeWithField.allowedOptions.includes(o.id)),
    };

    update.$unset = ['allowedOptions'];
  }

  if (field.schemaId) {
    update.schemaId = { $set: field.schemaId };
  }

  if (field.schemaType) {
    update.schemaType = { $set: field.schemaType };
  }

  if (field.related || mergeWithField.related) {
    update.related = {
      $set: mergeRelated([field.related, mergeWithField.related]),
    };
  }

  // Merging can leave `default` referencing options that no longer exist —
  // e.g. an inheriting schema restricts options via `allowedOptions`, or
  // overrides `options` while inheriting the parent's `default`. Purge the
  // orphaned tokens so the effective schema stays consistent (and the builder
  // preview doesn't crash rendering a default that resolves to no option).
  // Resolve a key's value once the merge is applied: a staged $set wins, then
  // an explicit override on mergeWithField, then the base field.
  const mergedValue = (key) => {
    if (update[key]) {
      return update[key].$set;
    }
    if (mergeWithField[key] !== undefined) {
      return mergeWithField[key];
    }
    return field[key];
  };
  const mergedDefault = mergedValue('default');
  const scrubbedDefault = scrubDefaultValue(mergedDefault, mergedValue('options'));
  const defaultChanged = Array.isArray(mergedDefault)
    ? scrubbedDefault === null || scrubbedDefault.length !== mergedDefault.length
    : scrubbedDefault !== mergedDefault;
  if (defaultChanged) {
    update.default = { $set: scrubbedDefault };
  }

  if (!_.keys(update).length) return field;

  return ih(field, update);
}

function reduceFields(mergedIn, mergeWith) {
  if (!_.get(mergeWith, 'fields')) {
    return mergedIn;
  }

  if (!_.get(mergedIn, 'fields')) {
    return mergeWith;
  }

  return {
    ...mergedIn,
    fields: assignSchemaValuesToNonAbstractFields(mergeWith)
      .fields.concat(mergedIn.fields)
      .reduce((fields, field) => {
        const index = fields
          .map((f) => f.slug ?? f.field)
          .indexOf(field.slug ?? field.field);

        if (index === -1) {
          fields.push(field);
        } else {
          fields[index] = mergeField(field, fields[index]);
        }

        return fields;
      }, []),
  };
}

function mergeAll(...args) {
  const options = {
    access: null,
  };

  if (args.length === 1) return _.first(args);

  if (_.last(args) && _.last(args).access !== undefined) {
    Object.assign(options, args.pop());
  }

  const merged = args
    .slice(1)
    .reduce(reduceFields, assignSchemaValuesToNonAbstractFields(args[0]));

  if (!options.access) return merged;

  const accessTypes = Object.keys(options.access);

  return {
    ...merged,
    fields: merged.fields.filter(
      (f) =>
        accessTypes.length
        === accessTypes.filter(
          (accessType) =>
            !f[accessType]
            || f[accessType].includes(options.access[accessType]),
        ).length,
    ),
  };
}

export default mergeAll;
