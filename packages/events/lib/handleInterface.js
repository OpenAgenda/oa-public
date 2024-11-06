import { promisify } from 'node:util';
import logs from '@openagenda/logs';

const log = logs('lib/handleInterface');

export default async ({ interfaces }, interfaceName, ...args) => {
  if (!interfaces?.[interfaceName]) {
    return;
  }

  const interfaceObj = interfaces[interfaceName];
  const fn = interfaceObj?.callback ? promisify(interfaceObj) : interfaceObj;

  try {
    return fn(...args);
  } catch (e) {
    log.error(e);
  }
};
