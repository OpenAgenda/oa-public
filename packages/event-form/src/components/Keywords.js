import _ from 'lodash';

import React, { Component } from 'react';

import ih from 'immutability-helper';
import TagsInput from 'react-tagsinput';

const separatorRegex = /;|,|\|/;

module.exports = class KeywordsComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      inputValues: {}
    };
  }

  onInputBlur(language, e) {
    if (!e.target.value.length) return;

    this.appendValue(language, e.target.value);
  }

  onInputChange(language, e) {
    const parts = e.target.value.split(separatorRegex);

    if (parts.length <= 1) {
      return this.setState({
        inputValues: ih(this.state.inputValues, _.set({}, language, { $set: e.target.value }))
      });
    }

    this.appendValue(language, parts[0]);
  }

  appendValue(language, item) {
    this.resetInput(language);

    this.props.onChange(ih(this.props.value || {}, _.set({}, language, {
      $set: _.uniq(_.get(this, ['props', 'value', language], []).concat(item))
    })));

  }

  onChange(language, aValue) {
    const { onChange, value } = this.props;
    this.resetInput(language);

    onChange(ih(value || {}, _.set({}, language, {
      $set: aValue
    })));
  }

  resetInput(language) {
    const { inputValues } = this.state;
    this.setState({
      inputValues: ih(
        inputValues,
        _.set({}, language, { $set: '' })
      )
    });
  }

  renderInput(l) {
    const { field, value, error } = this.props;

    const preCleaned = preClean(value, l);

    return (
      <div>
        <TagsInput
          value={preCleaned}
          onChange={this.onChange.bind(this, l)}
          inputProps={{
            value: _.get(this, ['state', 'inputValues', l], ''),
            onChange: this.onInputChange.bind(this, l),
            placeholder: field.placeholder,
            onBlur: this.onInputBlur.bind(this, l),
            style: !_.get(value, l) ? { width: '630px' } : null
          }}
        />
      </div>
    );
  }

  singleLanguageRender() {
    return (
      <div className="keywords">
        {this.renderInput(_.first(this.props.field.languages))}
      </div>
    );
  }

  render() {
    return this.singleLanguageRender();
  }
};

function preClean(value, lang) {
  const lValue = _.get(value, lang, []) || [];

  if (!_.isArray(lValue)) return [];

  return _.flatten(lValue.map(v => (v || '').split(',').map(v => v.trim())));
}
