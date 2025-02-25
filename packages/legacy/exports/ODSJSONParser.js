import _ from 'lodash';
import ih from 'immutability-helper';

function _setUpdateToFlattenTagGroups(tagSet, event) {
  // update of set values
  const update = _.get(event, 'tagGroups', []).reduce(
    (update1, group) =>
      _.set(update1, group.name, {
        $set: group.tags,
      }),
    {},
  );

  if (_.keys(update)) {
    update.$unset = ['tags', 'tagGroups'];
  }

  return _.get(tagSet, 'groups', [])
    .filter((g) => !_.keys(update).includes(g.name))
    .reduce(
      (update1, group) =>
        _.set(update1, group.name, {
          $set: [],
        }),
      update,
    );
}

export default (tagSet = {}, events = []) =>
  events.map((e) => ih(e, _setUpdateToFlattenTagGroups(tagSet, e)));
