import _isObject from "lodash/isObject.js";
import _get from "lodash/get.js";
import _keys from "lodash/keys.js";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import sa from 'superagent';
export default _ref => {
  let {
    res,
    values,
    files,
    query,
    method
  } = _ref;
  const hasFiles = _keys(files).length;

  // IE11 does not like empty strings;
  const req = sa[method || 'post'](res || _get(window, 'location.href'));
  req.ok(response => response.status < 500);
  if (_isObject(query)) {
    req.query(query);
  }
  if (!hasFiles) {
    return req.send({
      data: JSON.stringify(values)
    });
  }
  _keys(files).forEach(fieldName => {
    // handle multiple files if need be
    [].concat(files[fieldName]).forEach((file, index) => {
      if (!files[fieldName]) throw new Error("file field is not defined: ".concat(fieldName));
      req.attach(fieldName, files[fieldName][index]);
    });
  });
  req.field('data', JSON.stringify(values));
  return new _Promise((rs, rj) => {
    req.end((err, response) => err ? rj(err) : rs(response));
  });
};
//# sourceMappingURL=submit.js.map