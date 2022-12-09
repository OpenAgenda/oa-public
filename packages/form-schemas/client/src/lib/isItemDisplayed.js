import _ from 'lodash';

function isWithinRole(role, item) {
  if (!_.isArray(item.write)) return true;

  if (item.write.includes(role)) return true;

  return item.write.includes(role);
}

export default (role, item) => {
  if (item.type && item.type !== 'field') {
    return true;
  }

  if (!isWithinRole(role, item)) return false;

  return item.display;
};
