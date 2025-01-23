'use strict';

const s3UrlRegexStr = 's3\\.pub1\\.infomaniak\\.cloud\\/.*';
const s3UrlRegex = new RegExp(s3UrlRegexStr);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function s3UrlMatching(filename) {
  return expect.stringMatching(
    new RegExp(`${s3UrlRegexStr}${escapeRegExp(`/${filename}`)}`),
  );
}

function streamToBlob(stream, mimeType) {
  if (mimeType != null && typeof mimeType !== 'string') {
    throw new Error('Invalid mimetype, expected string.');
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream
      .on('data', (chunk) => chunks.push(chunk))
      .once('end', () => {
        const blob = mimeType != null
          ? new Blob(chunks, { type: mimeType })
          : new Blob(chunks);
        resolve(blob);
      })
      .once('error', reject);
  });
}

function formatLocation({ endpoint, projectId, bucket }, key) {
  const path = bucket ? `${bucket}/${key}` : key;
  if (!projectId && !endpoint) {
    return path;
  }

  try {
    const url = new URL(path, endpoint);
    url.hostname = `${projectId ? `${projectId}.` : ''}${url.hostname}`;

    return url.toString();
  } catch (_error) {
    return path;
  }
}

module.exports = s3UrlRegexStr;
module.exports = s3UrlRegex;
module.exports.escapeRegExp = escapeRegExp;
module.exports.s3UrlMatching = s3UrlMatching;
module.exports.streamToBlob = streamToBlob;
module.exports.formatLocation = formatLocation;
