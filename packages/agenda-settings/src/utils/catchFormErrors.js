import _ from 'lodash';
import { FORM_ERROR } from 'final-form';

export default function catchFormErrors(error, key) {
  if (!error?.response?.data) {
    throw error;
  }

  const { data } = error.response;
  const info = data.info || data;

  if (info?.errors) {
    const formErrors = info.errors.reduce((accu, next) => {
      _.set(accu, next.field, next.code);
      return accu;
    }, {});

    return key ? _.get(formErrors, key) : formErrors;
  }

  if (data.message || data.error?.message) {
    return { [FORM_ERROR]: data.message || data.error.message };
  }

  throw error;
}
