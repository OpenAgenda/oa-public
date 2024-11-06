import { promisify } from 'node:util';
import { log } from '@openagenda/logs';

const logger = log('lib/handleInterface');

export default async ({ interfaces }, interfaceName, ...args) => {
  if (!interfaces?.[interfaceName]) {
    return;
  }

  const interfaceObj = interfaces[interfaceName];
  const fn = interfaceObj?.callback ? promisify(interfaceObj) : interfaceObj;

  try {
    return fn(...args);
  } catch (e) {
    logger.error(e);
  }
};
