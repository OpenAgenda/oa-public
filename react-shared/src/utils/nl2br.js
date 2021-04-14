import React from 'react';

export default function nl2br(str) {
  const newlineRegex = /(\r\n|\r|\n)/g;

  if (typeof str === 'number') {
    return str;
  }

  if (typeof str !== 'string') {
    return '';
  }

  // TODO use react-uid
  return str.split(newlineRegex).map((line, index) => (line.match(newlineRegex)
    ? React.createElement('br', { key: index }) // eslint-disable-line react/no-array-index-key
    : line));
}
