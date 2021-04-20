import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.string.match";
import "core-js/modules/es.string.split";
import _mapInstanceProperty from "@babel/runtime-corejs3/core-js/instance/map";
import React from 'react';
export default function nl2br(str) {
  var _context;

  var newlineRegex = /(\r\n|\r|\n)/g;

  if (typeof str === 'number') {
    return str;
  }

  if (typeof str !== 'string') {
    return '';
  } // TODO use react-uid


  return _mapInstanceProperty(_context = str.split(newlineRegex)).call(_context, function (line, index) {
    return line.match(newlineRegex) ? /*#__PURE__*/React.createElement('br', {
      key: index
    }) // eslint-disable-line react/no-array-index-key
    : line;
  });
}
//# sourceMappingURL=nl2br.js.map