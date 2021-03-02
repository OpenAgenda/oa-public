'use strict';

module.exports = (data, eventUid) => {
  let locationUid = null;
  for (const event of data.ev) {
    if (event.u === eventUid) {
      locationUid = event.l;
      break;
    }
  }
  return locationUid;
}