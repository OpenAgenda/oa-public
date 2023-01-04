'use strict';

module.exports = function getMemberName(member, user) {
  return member.name ?? member.custom?.contactName ?? user.fullName;
};
