import logs from '@openagenda/logs';

const log = logs('paths');

const clean = (sourcePaths) =>
  (sourcePaths ? sourcePaths.map((path) => [].concat(path)) : []);
const pathIsIncluded = (paths, path) =>
  paths.map((p) => p.join('.')).includes(path.join('.'));

export function updateIsRequired(
  // paths that are currently referenced in aggregator
  referencePaths = [],
  // paths that are currently referenced in source
  sourcePaths = [],
  // uid of source
  leaf = null,
) {
  log('updateIsRequired', { referencePaths, sourcePaths, leaf });
  const pathsFromSource = clean(referencePaths)
    .filter((p) => p[p.length - 1] === leaf)
    .map((p) => p.slice(0, p.length - 1));

  const cleanSourcePaths = clean(sourcePaths);

  if (!cleanSourcePaths.length && !pathsFromSource.length) {
    return true;
  }

  if (cleanSourcePaths.length !== pathsFromSource.length) {
    return true;
  }

  const differentSourcePaths = cleanSourcePaths.filter(
    (p) => !pathIsIncluded(pathsFromSource, p),
  );

  return !!differentSourcePaths.length;
}

export function getAmended(referencePaths = [], sourcePaths = [], leaf = null) {
  log('getAmended', { referencePaths, sourcePaths, leaf });
  const paths = clean(referencePaths);

  const cleanSourcePaths = clean(sourcePaths);

  // if source is origin, it will contain no paths. A new path is created.
  if (!cleanSourcePaths.length) {
    cleanSourcePaths.push([]);
  }

  cleanSourcePaths.forEach((p) => {
    const amended = p.concat(leaf);
    if (!pathIsIncluded(paths, amended)) {
      paths.push(amended);
    }
  });
  return paths;
}

export function getFiltered(referencePaths = [], leaf = null) {
  log('getFiltered', { referencePaths, leaf });
  return clean(referencePaths).filter((p) => !p.includes(leaf));
}

export function endsShortestPath(referencePaths, leaf) {
  const shortestPath = referencePaths.reduce((shortest, path) =>
    (shortest && shortest.length < path.length ? shortest : path));

  return !!referencePaths.filter(
    (p) => p.length === shortestPath.length && p[p.length - 1] === leaf,
  ).length;
}
