import React, { useCallback } from 'react';
import isInteger from '@openagenda/utils/isInteger';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import FormSchemaComponent from '..';
import labels from './lib/labels';

const getLabel = makeLabelGetter(labels);

const fieldTypeChoices = [{
  id: 1,
  value: 'text',
  label: labels.textFieldType
}, {
  id: 4,
  value: 'textarea',
  label: labels.textareaFieldType
}, {
  id: 5,
  value: 'markdown',
  label: labels.markdownFieldType,
  info: labels.markdownFieldTypeInfo
}, {
  id: 6,
  value: 'integer',
  label: labels.integerFieldType
}, {
  id: 10,
  value: 'link',
  label: labels.linkFieldType
}, {
  id: 9,
  value: 'email',
  label: labels.emailFieldType
}, {
  id: 7,
  value: 'boolean',
  label: labels.booleanFieldType,
  info: labels.booleanFieldTypeInfo
}, {
  id: 3,
  value: 'checkbox',
  label: labels.checkboxFieldType,
  info: labels.checkboxFieldTypeInfo
}, {
  id: 12,
  value: 'multiselect',
  label: labels.multiselectFieldType,
  info: labels.multiselectFieldTypeInfo
}, {
  id: 2,
  value: 'radio',
  label: labels.radioFieldType,
  info: labels.radioFieldTypeInfo
}, {
  id: 11,
  value: 'select',
  label: labels.selectFieldType,
  info: labels.selectFieldTypeInfo
}, {
  id: 13,
  value: 'date',
  label: labels.dateFieldType,
  info: labels.dateFieldTypeInfo
}];

const flatChoices = lang => fieldTypeChoices.map(c => ({
  ...c,
  label: c.label[lang],
  info: c.info?.[lang]
}));

const getFieldType = valueOrId => fieldTypeChoices
  .find(choice => choice[isInteger(valueOrId) ? 'id' : 'value'] === valueOrId);

const ChosenType = ({ lang, value, onReset }) => {
  const {
    label, info
  } = getFieldType(value);

  return (
    <div>
      <div>{label[lang]}</div>
      {info ? <div className="text-muted">{info[lang]}</div> : null}
      <button
        type="button"
        className="btn btn-link padding-all-z"
        onClick={onReset}
      >
        {getLabel('chooseOtherType', lang)}
      </button>
    </div>
  );
};

export default function ChooseFieldType({
  value,
  onChange: propsOnChange,
  lang
}) {
  const onChange = useCallback(choice => {
    if (!choice) {
      propsOnChange(null);
      return;
    }
    const fieldTypeChoice = getFieldType(choice.values.fieldType);
    propsOnChange(fieldTypeChoice.value);
  }, [propsOnChange]);

  if (value) {
    return (
      <ChosenType
        onReset={() => onChange(null)}
        value={value}
        lang={lang}
        onChange={onChange}
      />
    );
  }

  return (
    <FormSchemaComponent
      stateless
      values={value ? { fieldType: getFieldType(value).id } : {}}
      onChange={onChange}
      schema={{
        fields: [{
          field: 'fieldType',
          placeholder: getLabel('chooseFieldTypePlaceholder', lang),
          fieldType: 'select',
          label: getLabel('chooseFieldType', lang),
          optional: false,
          options: flatChoices(lang)
        }]
      }}
      actionComponents={[{
        position: 'bottom',
        Component: () => null
      }]}
    />
  );
}
