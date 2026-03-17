import _ from 'lodash';

function setImmutable(obj, path, value) {
  const parts = path.split('.');
  if (parts.length === 1) {
    obj[parts[0]] = value;
    return;
  }
  // Shallow-clone intermediate objects to avoid mutating the original
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = { ...current[parts[i]] };
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

export default (fields, languages, event) => {
  if (!languages?.length) {
    return event;
  }

  const changes = {};
  let hasChanges = false;

  for (const field of fields) {
    const value = _.get(event, field);
    if (!_.isObject(value)) continue;

    const language = []
      .concat(languages)
      .filter((l) => value[l])
      .shift();

    changes[field] = value[language];
    hasChanges = true;
  }

  if (!hasChanges) return event;

  const result = { ...event };
  for (const [field, value] of Object.entries(changes)) {
    setImmutable(result, field, value);
  }

  return result;
};
