import _ from 'lodash';

export default (item, defaultTemplates) => {
  ['event', 'eventitem', 'header'].forEach((templateField) => {
    if (!item?.template?.[templateField] && defaultTemplates?.[templateField]) {
      _.set(item, ['template', templateField], defaultTemplates[templateField]);
    }
  });
  return item;
};
