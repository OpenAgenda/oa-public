import _ from 'lodash';

const multilangFields = ['title', 'description', 'freeText', 'tags'];

export default (data, lang) => {
  const existingLangs = multilangFields.reduce(
    (langs, field) => _.uniq(Object.keys(data[field] || {}).concat(langs)),
    [],
  );

  const chosenLang = existingLangs.includes(lang) ? lang : existingLangs.pop();

  return multilangFields
    .filter((field) => !!data[field])
    .reduce(
      (flattened, field) => ({
        ...flattened,
        [field]: data[field][chosenLang],
      }),
      {},
    );
};
