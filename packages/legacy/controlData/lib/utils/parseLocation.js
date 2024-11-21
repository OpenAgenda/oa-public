import _ from 'lodash';

export default (data) => {
  const parsed = _.mapValues(
    {
      u: 'uid',
      lt: 'latitude',
      lg: 'longitude',
    },
    (value) => _.get(data, value),
  );

  return parsed;
};
