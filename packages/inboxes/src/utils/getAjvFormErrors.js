function getErrorPath(errors) {
  return errors.map(error => {
    if (error.dataPath) {
      return error.dataPath;
    }

    if (error.params && error.params.missingProperty) {
      return error.params.missingProperty;
    }

    if (error.params && error.params.additionalProperty) {
      return error.params.additionalProperty;
    }

    return '';
  })[0];
}

function getErrors(error) {
  return error.params && error.params.errors ? error.params.errors : [error];
}

function getErrorCode(error) {
  const err = getErrors(error)[0];
  return err.keyword === 'type' ? `type.${err.params.type}` : err.keyword;
}

export default function getAjvFormErrors(errors) {
  if (!Array.isArray(errors) || errors === null) {
    return errors;
  }

  return errors.reduce((result, err) => {
    const path = getErrorPath(getErrors(err)).replace(/^\//, '');

    if (!path || result[path]) {
      return result;
    }

    if (
      ['errorMessage', 'type', 'required', 'additionalProperties'].includes(
        err.keyword
      )
    ) {
      result[path] = Object.assign(err, {
        message: err.message,
        code: getErrorCode(err),
      });
    }

    return result;
  }, {});
}
