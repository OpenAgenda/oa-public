'use strict';

module.exports = (data, options = {}) => {
  if (options?.userUid) {
    return options?.userUid;
  } else if (options?.context?.userUid) {
    return options.context.userUid;
  } else {
    return data.creatorUid;
  }
}