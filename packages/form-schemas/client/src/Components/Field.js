import _ from 'lodash';

import React, { Component } from 'react';
import classNames from 'classnames';
import debug from 'debug';

import FieldCounter from './FieldCounter';
import Help from './Help';
import Info from './Info';
import Sub from './Sub';
import MultilingualField from './Multilingual';
import TextField from './TextField';
import HTMLField from './HTMLField';
import MarkdownField from './MarkdownField';
import SlateField from './SlateField';
import RadioField from './RadioField';
import SingleSelectField from './SingleSelectField';
import MultiSelectField from './MultiSelectField';
import CheckboxField from './CheckboxField';
import BooleanField from './BooleanField';
import DateField from './DateField';
import FileField from './FileField';
import ImageField from './ImageField';

const flattenFieldLabels = require('../lib/flatten');
const isFieldEnabled = require('../lib/isFieldEnabled');
const isFieldOptional = require('../lib/isFieldOptional');
const hasHelp = require('../lib/hasHelp');

const FieldComponents = {
  multilingual: MultilingualField,
  text: TextField,
  integer: TextField,
  number: TextField,
  textarea: TextField,
  link: TextField,
  email: TextField,
  phone: TextField,
  html: HTMLField,
  markdown: MarkdownField,
  slate: SlateField,
  radio: RadioField,
  select: SingleSelectField,
  multiselect: MultiSelectField,
  checkbox: CheckboxField,
  boolean: BooleanField,
  date: DateField,
  file: FileField,
  image: ImageField
};

const log = debug('Field');

export default class Field extends Component {
  getFieldComponent(isMultilingual) {
    const {
      field: {
        fieldType,
        field
      },
      customComponents
    } = this.props;

    const CustomComponent = _.get(customComponents, fieldType);

    if (CustomComponent) {
      return CustomComponent;
    }

    if (isMultilingual) {
      return FieldComponents.multilingual;
    }

    if (FieldComponents[fieldType]) {
      return FieldComponents[fieldType];
    }

    throw new Error(`Field ${field} type has no associated component: ${fieldType}`);
  }

  render() {
    const {
      field: schemaField,
      disabled,
      value,
      onChange,
      error,
      labels,
      lang,
      className,
      relatedValues
    } = this.props;

    const field = flattenFieldLabels(schemaField, lang);

    const isMultilingual = Array.isArray(field.languages);

    const hasMaxCounter = field.max
      && !isMultilingual
      && !['integer', 'number'].includes(field.fieldType);

    // field is decorated with labels
    const decoratedByFieldComponent = ['boolean'].includes(field.fieldType);

    const FieldComponent = this.getFieldComponent(isMultilingual);

    const isEnabled = isFieldEnabled(field, relatedValues.enable, disabled);
    const isOptional = isFieldOptional(field, relatedValues.optional);
    log(
      'field %s is %s and %s',
      field.field,
      isOptional ? 'optional' : 'required',
      isEnabled ? 'enabled' : 'disabled'
    );

    return (
      <div
        className={classNames({
          [className]: true,
          disabled: !isEnabled,
          'has-error': !!error,
          'multilingual-input-field': isMultilingual
        })}
        key={field.field}
      >
        {!decoratedByFieldComponent && field.label ? (
          <label
            htmlFor={field.field}
            className={classNames({
              'control-label': true,
              'margin-right-xs': !isOptional || hasHelp(field)
            })}
          >
            {field.label}
          </label>
        ) : null}
        {!decoratedByFieldComponent && !isOptional ? (
          <span
            className={classNames({
              'margin-right-xs': hasHelp(field),
              error: !!error
            })}
          >
            {`(${labels.required})`}
          </span>
        ) : ''}
        {!decoratedByFieldComponent && hasHelp(field) ? (
          <Help
            id={`help-${field.field}`}
            label={field.help}
            lang={lang}
            link={field.helpLink}
            content={field.helpContent}
          />
        ) : null}
        {!decoratedByFieldComponent ? <Info value={field.info} /> : null }
        <FieldComponent
          enabled={isEnabled}
          lang={lang}
          field={field}
          value={value}
          error={error}
          onChange={onChange}
          relatedValues={relatedValues}
          labels={labels}
        />
        {hasMaxCounter ? <FieldCounter value={value} max={field.max} /> : null }
        {!isMultilingual && !decoratedByFieldComponent ? <Sub label={field.sub} error={error} /> : null}
      </div>
    );
  }
}
