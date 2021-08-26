import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import FieldCounter from './FieldCounter';
import Sub from './Sub';

import TextField from './TextField';
import HTMLField from './HTMLField';
import MarkdownField from './MarkdownField';

const FieldComponents = {
  text: TextField,
  textarea: TextField,
  html: HTMLField,
  markdown: MarkdownField
};

function extractLanguageValue(value, l) {
  if (!value) return;

  if (typeof value === 'string') {
    return value;
  }

  return value?.[l];
}

function multilingualizeValue(value, languages) {
  if (!value) return {};

  if (typeof value === 'string') {
    return languages.reduce((multilingualValue, language) => ({
      ...multilingualValue,
      [language]: value
    }), {});
  }

  return value;
}

export default class MultilingualField extends Component {
  onChange(language, singleLanguageValue) {
    const {
      onChange,
      value,
      field
    } = this.props;

    const multilingualizedValue = multilingualizeValue(value, field.languages);

    onChange({
      ...multilingualizedValue,
      [language]: singleLanguageValue
    });
  }

  renderField(l) {
    const {
      field,
      error,
      enabled,
      lang,
      value
    } = this.props;

    const FieldComponent = _.get(this.props, 'component', FieldComponents[field.fieldType]);

    const languageField = ih(field, {
      default: {
        $set: _.get(
          field,
          ['default', l],
          _.isObject(field.default) ? null : field.default
        )
      }
    });

    return (
      <div>
        <FieldComponent
          lang={lang}
          field={languageField}
          enabled={enabled}
          value={extractLanguageValue(value, l)}
          onChange={v => this.onChange(l, v)}
        />
        {field.max ? <FieldCounter value={_.get(value, l)} max={field.max} /> : null}
        <Sub label={field.sub} error={_.get(error, l)} />
      </div>
    );
  }

  render() {
    const { field } = this.props;

    if (field.languages.length === 1) {
      return this.renderField(field.languages[0]);
    }

    return (
      <ul className="list-unstyled">
        {field.languages.map(l => (
          <li key={`${field.field}_${l}`}>
            <div className="lang-input">
              <label htmlFor={`${field.field}.${l}`}>{l}</label>
              {this.renderField(l)}
            </div>
          </li>
        ))}
      </ul>
    );
  }
}
