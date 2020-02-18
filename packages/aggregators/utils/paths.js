'use strict';

const log = require('@openagenda/logs')('paths');

const clean = sourcePaths => sourcePaths ? sourcePaths.map(path => [].concat(path)) : [];
const pathIsIncluded = (paths, path) => paths.map(p => p.join('.')).includes(path.join('.'));

module.exports.updateIsRequired = (referencePaths = [], sourcePaths = [], leaf) => {
  log('updateIsRequired', { referencePaths, sourcePaths, leaf });
  const pathsFromSource = clean(referencePaths)
    .filter(p => p[p.length -1] === leaf)
    .map(p => p.slice(0, p.length -1));

  const cleanSourcePaths = clean(sourcePaths);

  if (cleanSourcePaths.length !== pathsFromSource.length) {
    return true;
  }

  const differentSourcePaths = cleanSourcePaths
    .filter(p => !pathIsIncluded(pathsFromSource, p));

  return !!differentSourcePaths.length;
}

module.exports.getAmended = (referencePaths = [], sourcePaths = [], leaf) => {
  log('getAmended', { referencePaths, sourcePaths, leaf });
  const paths = clean(referencePaths);

  const cleanSourcePaths = clean(sourcePaths);

  // if source is origin, it will contain no paths. A new path is created.
  if (!cleanSourcePaths.length) {
    cleanSourcePaths.push([]);
  }

  cleanSourcePaths.forEach(p => {
    const amended = p.concat(leaf);
    if (!pathIsIncluded(paths, amended)) {
      paths.push(amended);
    }
  });
  return paths;
}

module.exports.getFiltered = (referencePaths = [], leaf) => {
  log('getFiltered', { referencePaths, leaf });
  return clean(referencePaths)
    .filter(p => !p.includes(leaf));
}
