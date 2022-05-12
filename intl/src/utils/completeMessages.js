function hasValue(value) {
  return value && value !== '';
}

export default function completeMessages(messages, fallbackMessages) {
  return Object.keys(fallbackMessages)
    .reduce((accu, key) => {
      const fallbackValue = fallbackMessages[key];
      const value = messages[key];

      if (!hasValue(value) && hasValue(fallbackValue)) {
        accu[key] = fallbackValue;
      }

      return accu;
    }, messages);
}
