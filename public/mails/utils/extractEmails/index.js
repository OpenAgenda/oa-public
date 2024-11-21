import tlds from 'tlds' with { type: 'json' };
import normalizeInput from './normalizeInput.js';

export default (input) => {
  const matches = normalizeInput(input).match(
    /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g,
  );

  if (!matches) {
    return [];
  }

  return matches
    .map((email) => email)
    .filter((email) => {
      for (const tld of tlds) {
        if (email.endsWith(`.${tld}`)) {
          return true;
        }
      }

      return false;
    })
    .filter((email, index, self) => self.indexOf(email) === index)
    .map((email) => ({
      email,
    }));
};
