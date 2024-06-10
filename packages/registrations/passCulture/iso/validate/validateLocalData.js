import validateSpreadLocalData from './validateSpreadLocalData.js';
import validateMergedLocalData from './validateMergedLocalData.js';

export default function validateLocalData(data, event, options = {}) {
  return Array.isArray(data) ? validateSpreadLocalData(data, event, options) : validateMergedLocalData(data, event, options);
}
