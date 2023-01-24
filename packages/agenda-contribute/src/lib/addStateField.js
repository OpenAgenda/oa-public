import _ from 'lodash';
import labels from '@openagenda/labels/event/states';
import makeLabelGetter from '@openagenda/labels';

export default function addStateField(schema, locale) {
  const getLabel = makeLabelGetter(labels, locale);

  schema.fields.push({
    field: 'state',
    fieldType: 'select',
    label: _.capitalize(getLabel('state')),
    info: getLabel('stateFieldInfo'),
    options: [{
      id: -1,
      value: 'refused',
    }, {
      id: 0,
      value: 'tocontrol',
    }, {
      id: 1,
      value: 'controlled',
    }, {
      id: 2,
      value: 'published',
    }].map(o => ({
      ...o,
      label: _.capitalize(getLabel(o.value)),
    })),
  });
}
