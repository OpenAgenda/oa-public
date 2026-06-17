import _ from 'lodash';

const fieldHasUnnassignedOptions = (field) =>
  !!(field?.options ?? []).filter((o) => o.id === undefined).length;
const fieldHasSuperiorOptions = (field, nextOptionId) =>
  !!(field?.options ?? []).filter((o) => o.id > nextOptionId).length;

function fieldAssignOptionIds(field, nextOptionId) {
  let nextId = nextOptionId;
  const valueToId = {};
  field.options.forEach((o) => {
    if (o.id !== undefined) {
      return;
    }
    nextId += 1;
    o.id = nextId;
    if (o.value !== undefined) {
      valueToId[o.value] = o.id;
    }
  });

  // A default may reference an option by its `value` when the option had no id
  // yet (set in the builder before the field was persisted). Now that ids are
  // assigned, remap those value tokens to their freshly assigned id.
  if (
    field.default !== undefined
    && field.default !== null
    && Object.keys(valueToId).length
  ) {
    const remap = (token) =>
      (Object.prototype.hasOwnProperty.call(valueToId, token)
        ? valueToId[token]
        : token);
    field.default = Array.isArray(field.default)
      ? field.default.map(remap)
      : remap(field.default);
  }

  return nextId;
}

function extractNextOptionId(formSchemaData) {
  const definedNextOptionId = formSchemaData?.nextOptionId ?? 0;

  const optionIds = _.uniq(
    _.flatten(
      _.get(formSchemaData, 'fields', [])
        .filter((f) => f.options)
        .map((f) => f.options),
    ),
  );

  const biggestId = optionIds.reduce(
    (bId, optionId) => (bId < optionId ? optionId : bId),
    0,
  );

  return definedNextOptionId > biggestId ? definedNextOptionId : biggestId + 1;
}

export {
  extractNextOptionId,
  fieldHasUnnassignedOptions,
  fieldAssignOptionIds,
  fieldHasSuperiorOptions,
};
