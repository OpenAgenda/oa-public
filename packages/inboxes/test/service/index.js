import fixtures from '@openagenda/fixtures';
import createService from '../../src';

export default createService;

const allowedTables = [
  'inbox',
  'inboxUser',
  'conversation',
  'inboxConversation',
  'message',
];
const defaultFiles = [
  'inbox',
  'inboxUser',
  'conversation',
  'inboxConversation',
  'message',
];

export function initAndLoad(config, files, options) {
  let cleanFiles = files;
  let cleanOptions = options;

  if (arguments.length === 2 && Array.isArray(files)) {
    cleanOptions = { reset: true };
  } else if (arguments.length === 2) {
    cleanOptions = files;
    cleanFiles = defaultFiles;
  } else if (arguments.length === 1) {
    cleanOptions = { reset: true };
    cleanFiles = defaultFiles;
  }

  const params = { reset: true, ...cleanOptions };

  fixtures.init({ mysql: config.mysql });

  // reset before migrations if needed
  return new Promise((resolve, reject) => {
    fixtures([], { reset: params.reset }, async err => {
      if (err) {
        return reject(err);
      }

      fixtures(
        allowedTables
          .map(tableName => ({
            table: config.schemas[tableName],
            src: `${__dirname}/${tableName}.data.sql`,
          }))
          .filter(f => cleanFiles.includes(f.src.split('/').pop().split('.')[0])),
        { reset: false },
        error => {
          if (error) return reject(error);
          resolve(createService(config));
        }
      );
    });
  });
}

export function seed(config, files = defaultFiles, options = { reset: false }) {
  fixtures.init({ mysql: config.mysql });

  return new Promise((resolve, reject) => {
    fixtures(
      allowedTables
        .map(tableName => ({
          table: config.schemas[tableName],
          src: `${__dirname}/${tableName}.data.sql`,
        }))
        .filter(f => files.includes(f.src.split('/').pop().split('.')[0])),
      options,
      err => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}
