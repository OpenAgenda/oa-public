import _ from 'lodash';
import { DEFAULT_LANG, DEFAULT_FALLBACK_MAP } from './constants';

function completeMessages(messages, fallbackMessages) {
  return _.reduce(
    messages,
    (accu, value, key) => {
      if (value && value !== '') {
        accu[key] = value;
      }

      return accu;
    },
    fallbackMessages,
  );
}

export default function getFallbackedMessages(
  messagesMap,
  fallbackMap = DEFAULT_FALLBACK_MAP,
  defaultLang = DEFAULT_LANG,
) {
  const langs = Object.keys(messagesMap);
  const result = {};

  for (const lang of langs) {
    let cursor = fallbackMap[lang];

    result[lang] = messagesMap[cursor];

    while (cursor) {
      result[lang] = completeMessages(result[lang], messagesMap[cursor]);
      cursor = fallbackMap[cursor];
    }

    result[lang] = completeMessages(result[lang], messagesMap[defaultLang]);
  }

  return result;
}
