import multilingualValidator from '@openagenda/validators/multilingual';
import checkAndConvertToMarkdown from './checkAndConvertToMarkdown.js';

export default function longDescriptionValidator(config) {
  const validate = multilingualValidator(config);
  return (value) => validate(checkAndConvertToMarkdown(value, config));
}
