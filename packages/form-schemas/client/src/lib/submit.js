import _ from 'lodash';
import qs from 'qs';

export default ({ res, values, files, query, method }) => {
  const hasFiles = _.keys(files).length;

  let url = res || _.get(window, 'location.href');
  if (_.isObject(query)) {
    url += (url.includes('?') ? '&' : '?') + qs.stringify(query);
  }

  const fetchOptions = {
    method: method?.toUpperCase() || 'POST',
  };

  if (!hasFiles) {
    fetchOptions.headers = {
      'Content-Type': 'application/json',
    };
    fetchOptions.body = JSON.stringify({
      data: JSON.stringify(values),
    });
  } else {
    const formData = new FormData();

    _.keys(files).forEach((fieldName) => {
      [].concat(files[fieldName]).forEach((file, index) => {
        if (!files[fieldName]) throw new Error(`file field is not defined: ${fieldName}`);

        formData.append(fieldName, files[fieldName][index]);
      });
    });

    formData.append('data', JSON.stringify(values));
    fetchOptions.body = formData;
  }

  return fetch(url, fetchOptions).then((response) => {
    if (response.status >= 500) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response
      .json()
      .then((body) => ({
        status: response.status,
        ok: response.ok,
        body,
      }))
      .catch(() => ({
        status: response.status,
        ok: response.ok,
        body: null,
      }));
  });
};
