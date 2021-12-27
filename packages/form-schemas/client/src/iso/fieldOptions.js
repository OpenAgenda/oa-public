'use strict';

const _ = require('lodash');

const fieldHasUnnassignedOptions = field => !!(field?.options ?? []).filter(o => o.id === undefined).length;
const fieldHasSuperiorOptions = (field, nextOptionId) => !!(field?.options ?? []).filter(o => o.id > nextOptionId).length;

function fieldAssignOptionIds(field, nextOptionId) {
  let nextId = nextOptionId;
  field.options.forEach(o => {
    if (o.id !== undefined) {
      return;
    }
    nextId += 1;
    o.id = nextId;
  });

  return nextId;
}

function extractNextOptionId(formSchemaData) {
  const definedNextOptionId = formSchemaData?.nextOptionId ?? 0;

  const optionIds = _.uniq(_.flatten(
    _.get(formSchemaData, 'fields', [])
      .filter(f => f.options)
      .map(f => f.options)
  ));

  const biggestId = optionIds.reduce((bId, optionId) => (bId < optionId ? optionId : bId), 0);

  return definedNextOptionId > biggestId ? definedNextOptionId : biggestId + 1;
}

module.exports = {
  extractNextOptionId,
  fieldHasUnnassignedOptions,
  fieldAssignOptionIds,
  fieldHasSuperiorOptions
};
