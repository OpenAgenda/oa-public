import _ from 'lodash';

function isWithinRole(role, value) {
  if (!_.isArray(value)) return true;

  if (value.includes(role)) return true;

  return value.includes(role);
}

export default (role, item) => {
  if (item.type && item.type !== 'field') {
    return true;
  }

  if (!isWithinRole(role, item.write)) return false;

  if (Array.isArray(item.display)) {
    return isWithinRole(role, item.display);
  }

  return item.display;
};
