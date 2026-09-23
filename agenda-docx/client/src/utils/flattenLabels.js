export default (labels, lang) =>
  Object.keys(labels).reduce((flat, key) => {
    flat[key] = labels[key][lang];

    return flat;
  }, {});
