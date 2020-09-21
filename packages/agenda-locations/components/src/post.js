import _ from 'lodash';
import sa from 'superagent';

export default (res, values, cb) => {
  const {
    fileless,
    files
  } = Object.keys(values).reduce(({ fileless, files }, fieldName) => {
    (_areFiles(values[fieldName]) ? files : fileless)[fieldName] = values[fieldName];
    return { fileless, files };
  }, { fileless: {}, files: {} });

  // IE11 does not like empty strings;
  const req = sa.post(res || window.location.href);

  req.ok(res => res.status < 500);

  if (!Object.keys(files).length) {
    return req.send({
      data: JSON.stringify(fileless)
    });
  }

  Object.keys(files).forEach(fieldName => {
    // handle multiple files if need be
    [].concat(files[fieldName]).forEach((file, index) => {
      if (!files[fieldName]) throw new Error('file field is not defined: ' + fieldName);
      req.attach(fieldName, files[fieldName][index]);
    });
  });

  req.field('data', JSON.stringify(fileless));

  req.end((err, res) => {
    if (err) return cb(err);

    cb(null, res.body);
  });

}

function _areFiles(value) {
  if (!(value instanceof Array)) return false;
  if (!value.length) return false;
  return value[0] instanceof File
}
