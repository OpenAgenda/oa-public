'use strict';

module.exports = ({
  defaultImage
}) => (agenda, options = {}) => {
  if (agenda.image) {
    return agenda;
  };
  return {
    ...agenda,
    image: options.useDefaultImage ? defaultImage : null
  };
};
