'use strict';

module.exports = (data, options = {}) => {
  if (options?.userUid) {
    return options?.userUid;
  }
  if (options?.context?.userUid) {
    return options.context.userUid;
  }
  return data.creatorUid;
};
