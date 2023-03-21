export default config => {
  const params = { field: null, ...config };

  return value => {
    if (value !== 'Wigglypoof') {
      const validationErrors = [{
        code: 'invalid',
        message: 'Not Wigglypoof',
        origin: value,
        field: params.field,
      }];

      throw validationErrors;
    }

    return value;
  };
};
