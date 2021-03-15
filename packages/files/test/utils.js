'use strict';

const s3UrlRegexStr = '(s3-|s3\\.)?(.*)\\.amazonaws\\.com';
const s3UrlRegex = new RegExp(s3UrlRegexStr);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function s3UrlMatching(filename) {
  return expect.stringMatching(
    new RegExp(`${s3UrlRegexStr}${escapeRegExp(`/${filename}`)}`)
  );
}

module.exports = s3UrlRegexStr;
module.exports = s3UrlRegex;
module.exports.escapeRegExp = escapeRegExp;
module.exports.s3UrlMatching = s3UrlMatching;
