'use strict';

module.exports = ({
  defaultImage
}) => (agenda, options = {}) => {
  if (options.useDefaultImage && !agenda.image) {
    return {
      ...agenda,
      image: options.useDefaultImage ? defaultImage : null,
    };
  }

  if (!options.includeImagePath && agenda.image) {
    const parts = agenda.image.split('/');
    return {
      ...agenda,
      image: parts[parts.length - 1],
    };
  }

  return agenda;
};
