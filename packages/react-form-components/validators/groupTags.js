'use strict';

const utils = require('@openagenda/utils');

/**
 * errors are a list of objects that contain the following fields
 *   - a message
 *   - a field name
 *   - a group name
 *   - a code
 *   - the origin value of the error
 *   - values relevent to the error ( optional )
 */

module.exports = (set) => {
  function validateGroup(group, values) {
    if (!group.required) return;

    const ids = (values || []).map((v) => v.id);

    if (!group.tags.filter((t) => ids.indexOf(t.id) !== -1).length) {
      // eslint-disable-next-line no-throw-literal
      throw [
        {
          field: set.field,
          group: group.name ? group.name : 'Tags',
          code: 'groupTags.required',
          message: 'a selection is required',
          origin: group.tags,
          values: {},
        },
      ];
    }

    // no cleaning.
    return values;
  }

  function validate(values, groupIndex) {
    if (groupIndex !== undefined)
      return validateGroup(set.groups[groupIndex], values);

    let errors = [];

    set.groups.forEach((group) => {
      try {
        validateGroup(group, values);
      } catch (errs) {
        errors = errors.concat(errs);
      }
    });

    if (errors.length) throw errors;

    // no cleaning for this
    return values;
  }

  return utils.extend(validate, {
    field: set.field,
  });
};
