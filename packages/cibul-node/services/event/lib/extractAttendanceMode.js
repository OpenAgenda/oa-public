'use strict';

module.exports = function extractAttendanceMode(data) {
  const extracted = {
    attendanceMode: 1,
    onlineAccessLink: null,
  };

  try {
    if (data?.attendanceMode !== undefined) {
      extracted.attendanceMode = data.attendanceMode;
      extracted.onlineAccessLink = data.onlineAccessLink;
    } else if (data.store !== undefined) {
      const store = JSON.parse(data.store);
      extracted.attendanceMode = store.attendanceMode;
      extracted.onlineAccessLink = store.onlineAccessLink;
    }
  } catch (e) {
    console.log(e);
  }
  return extracted;
};
