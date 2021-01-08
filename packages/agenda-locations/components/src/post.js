import _ from 'lodash';
import sa from 'superagent';

export default (res, values, cb) => {
  const { fileless, files } = Object.keys(values).reduce(
    ({ fileless, files }, fieldName) => {
      (_areFiles(values[fieldName]) ? files : fileless)[fieldName] =
        values[fieldName];
      return { fileless, files };
    },
    { fileless: {}, files: {} }
  );

  // IE11 does not like empty strings;
  const req = sa.post(res || window?.location?.href);

  req.ok(res => res.status < 500);

  if (!Object.keys(files).length) {
    req.send(fileless);
  } else {
    Object.keys(files).forEach(fieldName => {
      // handle multiple files if need be
      const fieldFiles = [].concat(files[fieldName]);
      fieldFiles.forEach((file, index) => {
        req.attach(fieldName, fieldFiles[index]);
      });
    });

    req.field('data', JSON.stringify(fileless));
  }

  req.end((err, res) => cb(err, res?.body));
};

function _areFiles(value) {
  const values = value ? [].concat(value) : [];
  if (!values.length) return false;
  return values[0] instanceof File;
}
