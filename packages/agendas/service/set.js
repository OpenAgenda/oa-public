import update from './lib/update.js';
import create from './lib/create.js';

function _areIdentifiers(identifiers) {
  if (typeof identifiers === 'number') return true;

  return !Object.keys(identifiers)

    .filter((k) => ['id', 'uid', 'slug'].indexOf(k) === -1).length;
}

function set(
  { knex, schemas, slugUnicity, interfaces, upload, service, imagePath },
  ...args
) {
  const dependencies = {
    knex,
    schemas,
    slugUnicity,
    interfaces,
    upload,
    service,
    imagePath,
  };

  if (_areIdentifiers(args[0])) {
    return update(dependencies, ...args);
  }

  return create(dependencies, ...args);
}

export default set;
