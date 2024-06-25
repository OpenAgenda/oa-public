import logs from '@openagenda/logs';
import spreadPCData from '../spreadPCData.js';
import validateSpreadLocalData from './validateSpreadLocalData.js';
import validateMergedLocalData from './validateMergedLocalData.js';

const log = logs('validate/validateLocalData');

export default function validateLocalData(data, event, options = {}) {
  if (Array.isArray(data)) {
    const spreadData = spreadPCData(data);

    log('data is spread', { data, spreadData });
    return validateSpreadLocalData(spreadData, event, options);
  }
  return validateMergedLocalData(data, event, options);
}
