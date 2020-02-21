'use strict';

module.exports.getMultiLanguageTitle = (entity, lang) => {
  if (typeof entity.title === 'string') {
    return entity.title;
  }

  const keys = Object.keys(entity.title);
  return entity.title[lang] || entity.title[keys[0]];
}

