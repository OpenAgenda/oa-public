import multilingualValidator from '@openagenda/validators/multilingual';

import checkAndConvertToMarkdown from './checkAndConvertToMarkdown.js';

function removeNewLines(value) {
  if (!value) {
    return value;
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).reduce(
      (markdownified, lang) => ({
        ...markdownified,
        [lang]: removeNewLines(value[lang]),
      }),
      {},
    );
  }

  return value.replace(/\r\n|\n/g, ' ');
}

export default function longDescriptionValidator(config) {
  const validate = multilingualValidator(config);
  return (value) =>
    validate(checkAndConvertToMarkdown(removeNewLines(value), config));
}
