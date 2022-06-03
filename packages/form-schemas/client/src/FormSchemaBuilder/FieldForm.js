import React, { Component } from 'react';
import passValidator from '@openagenda/validators/pass';
import FormSchemaComponent from '..';

import merge from '../iso/merge';
import flattenLabels from '../lib/flatten';
import slugFromLabel from './lib/slugFromLabel';
import fg from './lib/fieldGroups';
import Options from './Options';
import unflattenLabels from './lib/unflattenLabels';
import restrictLabelLanguages from './lib/restrictLabelLanguages';
import optionsValidator from './lib/optionsValidator';

const assignConstraintsToFields = (schema, parents) => schema.fields.reduce((carriedSchema, field) => {
  carriedSchema.fields.push({
    ...field,
    constraints: parents ? parents[field.field] : null
  });
  return carriedSchema;
}, { ...schema, fields: [] });

const fieldOrder = order => ({ fields: order.map(f => ({ field: f, fieldType: 'abstract' })) });

const fieldSchemaTypes = {
  labels: ({ labelLanguages }) => fg.labels({ labelLanguages }),
  textLike: ({ labelLanguages, parentsField }) => merge(
    fg.labels({ labelLanguages }),
    parentsField ? null : fg.minMax({ min: 0, max: 255 }),
    parentsField?.optional ? fg.optional() : null,
    fieldOrder(['label', 'optional', 'min', 'max', 'info', 'placeholder', 'sub'])
  ),
  radioLike: ({ labelLanguages, parentsField }) => merge(
    fg.labels({ labelLanguages }),
    parentsField ? null : fg.optional(),
    parentsField ? null : fg.options({ labelLanguages }),
    fieldOrder(['label', 'optional', 'options', 'placeholder', 'sub'])
  ),
  customLike: customFieldSchema => ({ labelLanguages }) => merge(
    customFieldSchema.fields.some(f => f.field === 'label') ? fg.labels({ labelLanguages }) : null,
    customFieldSchema.fields.some(f => f.field === 'optional') ? fg.optional() : null,
    customFieldSchema
  )
};

const schemas = (fieldType, { customFieldConfigurationSchemas }) => {
  if (['text', 'textarea', 'markdown', 'link', 'boolean', 'email', 'integer'].includes(fieldType)) {
    return fieldSchemaTypes.textLike;
  }
  if (['radio', 'checkbox', 'select', 'multiselect'].includes(fieldType)) {
    return fieldSchemaTypes.radioLike;
  }
  if (customFieldConfigurationSchemas && customFieldConfigurationSchemas[fieldType]) {
    return fieldSchemaTypes.customLike(customFieldConfigurationSchemas[fieldType]);
  }
  return fieldSchemaTypes.labels;
};

export default class FieldForm extends Component {
  constructor(props) {
    super(props);

    const { labelLanguages, field, lang } = props;

    this.state = {
      values: labelLanguages.length ? unflattenLabels(field, labelLanguages) : flattenLabels(field, lang),
      errors: []
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange({ values, errors }) {
    this.setState({ errors, values });
  }

  onSubmit(sanitize) {
    const {
      lang,
      field,
      initFieldType,
      labelLanguages,
      onSubmit
    } = this.props;

    const { values } = this.state;
    const { errors } = sanitize(values);

    if (errors.length) {
      return this.setState({ errors });
    }

    if (!values || (this.state?.errors || []).length) return;

    onSubmit(Object.assign(restrictLabelLanguages(values, labelLanguages), {
      fieldType: field?.fieldType ?? initFieldType,
      field: field?.field || slugFromLabel(values.label, lang)
    }));
  }

  render() {
    const {
      labelLanguages,
      lang,
      field: propsField,
      initFieldType,
      actionComponent,
      customFieldConfigurationSchemas, // new
      components, // new
      parentsField
    } = this.props;
    const { values, errors } = this.state;

    const field = propsField ?? {
      fieldType: initFieldType
    };

    const schema = assignConstraintsToFields(
      schemas(field.fieldType, { customFieldConfigurationSchemas })({ labelLanguages, parentsField }),
      parentsField
    );

    const customs = components ? Object.keys(components).reduce((prev, curr) => ({ ...prev, [curr]: passValidator }), {}) : null;
    schema.custom = {
      ...customs,
      options: optionsValidator,
    };

    return (
      <div className="margin-top-sm">
        <FormSchemaComponent
          stateless
          values={values}
          errors={errors}
          components={{
            options: Options,
            ...components
          }}
          onChange={this.onChange}
          lang={lang}
          schema={schema}
          actionComponents={[{
            position: 'bottom',
            Component: ({ sanitize }) => actionComponent({
              onSubmit: this.onSubmit.bind(this, sanitize)
            })
          }]}
        />
      </div>
    );
  }
}
