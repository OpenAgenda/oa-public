import _ from 'lodash';

export default function applyMask(activity) {
  const { mask, ...rest } = activity;

  if (mask) {
    return _.omit(rest, JSON.parse(mask));
  }

  return rest;
};
