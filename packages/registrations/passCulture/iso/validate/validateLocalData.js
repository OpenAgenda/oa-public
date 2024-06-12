import spreadPCData from '../spreadPCData.js';
import validateSpreadLocalData from './validateSpreadLocalData.js';
import validateMergedLocalData from './validateMergedLocalData.js';

export default function validateLocalData(data, event, options = {}) {
  if (Array.isArray(data)) {
    return validateSpreadLocalData(spreadPCData(data), event, options);
  }
  return validateMergedLocalData(data, event, options);
}
