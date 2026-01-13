import _ from 'lodash';
import FormSchema from './FormSchema.js';

function filterFromSchema(data, schema) {
  return schema.fields.reduce((filtered, field) => {
    if (data[field.field] === undefined) {
      return filtered;
    }
    return {
      ...filtered,
      [field.field]: data[field.field],
    };
  }, {});
}

function mergeStoredDataWithPatch(input, patch, { schema, defaultLang }) {
  return schema.fields
    .filter((f) => f.languages)
    .filter(
      (field) =>
        input[field.field] !== undefined || patch[field.field] !== undefined,
    )
    .map((field) => ({
      fieldName: field.field,
      fieldLanguages: field.languages,
      fieldPatch:
        typeof patch[field.field] === 'string'
          ? { [defaultLang]: patch[field.field] }
          : patch[field.field],
    }))
    .reduce(
      (carry, { fieldName, fieldLanguages, fieldPatch }) => {
        const merged = { ...input[fieldName], ...fieldPatch };
        // Filter to only keep languages specified in the field's languages array
        const filtered = fieldLanguages
          ? _.pick(merged, fieldLanguages)
          : merged;

        return {
          ...carry,
          [fieldName]: filtered,
        };
      },
      {
        ...input,
        ...patch,
      },
    );
}

function extractUnauthorized({
  schema,
  access,
  input,
  stored,
  bypassAuthorization,
}) {
  const response = {
    input: {},
    fields: [],
    stored: {},
    errors: [],
    has: {
      input: false,
      fields: false,
      stored: false,
    },
  };

  if (bypassAuthorization) {
    return response;
  }

  const writeAccess = access?.write ?? (typeof access === 'string' ? access : null);

  Object.assign(
    response,
    (schema?.fields ?? []).reduce((unauthorized, field) => {
      if (
        !(field.write ?? []).length
        || input[field.field] === undefined
        || field.write.includes(writeAccess)
      ) {
        return unauthorized;
      }

      unauthorized.input[field.field] = input[field.field];
      unauthorized.fields.push(field.field);

      if (stored?.[field.field] !== undefined) {
        unauthorized.stored[field.field] = stored[field.field];
      }

      return unauthorized;
    }, response),
  );

  return {
    ...response,
    errors: response.fields.map((field) => ({
      field,
      code: 'unauthorized',
      message: 'not authorized to edit this field',
    })),
    has: {
      input: !!Object.keys(response.input).length,
      fields: !!Object.keys(response.fields).length,
      stored: !!Object.keys(response.stored).length,
    },
  };
}

export default function validateBySchema(schema, input, options = {}) {
  const {
    access = null,
    isPatch = false,
    isDraft = false,
    stored,
    defaultLang,
    throwOnUnauthorized = true,
    bypassAuthorization = false,
    validateInputOnly = false,
  } = options;

  const validate = new FormSchema(schema, {
    requireLabels: false,
  }).getValidate({
    draft: isDraft,
  });

  const unauthorized = extractUnauthorized({
    schema,
    access,
    input,
    stored,
    bypassAuthorization,
  });

  const filteredInput = unauthorized.has.input
    ? Object.keys(input).reduce(
      (carry, key) =>
        (unauthorized.fields.includes(key)
          ? carry
          : {
            ...carry,
            [key]: input[key],
          }),
      {},
    )
    : input;

  let dataToValidate;

  if (validateInputOnly) {
    dataToValidate = filteredInput;
  } else if (isPatch && stored) {
    dataToValidate = mergeStoredDataWithPatch(stored, filteredInput, {
      schema,
      defaultLang,
    });
  } else if (!isPatch && unauthorized.has.stored) {
    dataToValidate = { ...unauthorized.stored, ...filteredInput };
  } else {
    dataToValidate = filteredInput;
  }

  let validationErrors;
  let clean;

  try {
    clean = (isDraft || validateInputOnly ? validate.part : validate)(
      dataToValidate,
    );
  } catch (e) {
    validationErrors = e;
  }

  if (validationErrors) {
    throw (throwOnUnauthorized ? unauthorized.errors : []).concat(
      validationErrors,
    );
  }

  if (throwOnUnauthorized && unauthorized.errors.length) {
    throw unauthorized.errors;
  }

  if (validateInputOnly && stored) {
    clean = mergeStoredDataWithPatch(filterFromSchema(stored, schema), clean, {
      schema,
      defaultLang,
    });
  }

  if (stored || !unauthorized.fields) {
    return clean;
  }

  return _.omit(clean, unauthorized.fields);
}
