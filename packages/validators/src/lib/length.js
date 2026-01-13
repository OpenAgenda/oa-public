import errors from './errors';

export default function validateLength(value, term, params) {
  const values = {
    ...params.min === undefined ? undefined : { min: params.min },
    ...params.max === undefined ? undefined : { max: params.max },
  };

  if (value.length < params.min) {
    throw errors(
      params,
      value,
      `${term}.tooshort`,
      `the ${term} is too short`,
      { values }
    );
  }

  if (value.length > params.max) {
    throw errors(
      params,
      value,
      `${term}.toolong`,
      `the ${term} is too long`,
      { values }
    );
  }
};