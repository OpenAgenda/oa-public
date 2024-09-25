'use strict';

const createEmojiRegexModule = require('emoji-regex');

const createEmojiRegex = createEmojiRegexModule.default || createEmojiRegexModule;

const emojiRegex = createEmojiRegex();

const isLookbehindSupported = (() => {
  try {
    return /(?<=a)b/.test('ab');
  } catch (error) {
    return false;
  }
})();

module.exports = (input) => {
  let result = decodeURIComponent(input).replace(emojiRegex, ' ');

  if (isLookbehindSupported) {
    result = result.replace(
      /(?<=\s|^)([a-z0-9.-_@])\s?(?=[a-z0-9.-_@](?:\s|$))/g,
      '$1',
    );
  }

  result = result
    .replace(/\s+at\s+/g, '@')
    .replace(/\s+dot\s+/g, '.')
    .replace(/\s*<at>\s*/g, '@')
    .replace(/\s*<dot>\s*/g, '.')
    .replace(/\s*\(at\)\s*/g, '@')
    .replace(/\s*\(dot\)\s*/g, '.')
    .replace(/\s*\[at\]\s*/g, '@')
    .replace(/\s*\[dot\]\s*/g, '.')

    // Matches all ASCII characters from the space to tilde.
    .replace(/[^ -~]/g, ' ')
    .trim()
    .toLowerCase();

  return result;
};
