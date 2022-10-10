'use strict';

const _ = require('lodash');

module.exports = function extractAttendanceMode(data) {
  const extracted = {
    attendanceMode: 1,
    onlineAccessLink: null,
  };

  try {
    Object.assign(
      extracted,
      _.pick(
        JSON.parse(data.store),
        ['attendanceMode', 'onlineAccessLink']
      )
    );
  } catch (e) {
    console.log(e);
  }
  return extracted;
};
