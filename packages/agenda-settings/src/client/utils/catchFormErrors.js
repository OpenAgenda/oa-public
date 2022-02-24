import { FORM_ERROR } from 'final-form';

export default function catchFormErrors(error) {
  if (error.response?.data?.errors) {
    return error.response.data.errors.reduce((accu, next) => {
      accu[next.field] = next.code;
      return accu;
    }, {});
  }

  if (error.response?.data?.error?.message) {
    return { [FORM_ERROR]: error.response.data.error.message };
  }

  throw error;
}
