'use strict';

module.exports = range => {
  return (range || '').split(',').shift();
}
