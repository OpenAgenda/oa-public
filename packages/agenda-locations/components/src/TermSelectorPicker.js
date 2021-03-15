import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import TermSelector from './TermSelector';

class TermSelectorPicker extends React.Component {
  static defaultProps = {
    lang: 'en',
  };

  static propTypes = {
    value: PropTypes.object.isRequired,
    lang: PropTypes.string,
    fields: PropTypes.object,

    // field showing by default
    defaultField: PropTypes.string,
    res: PropTypes.string,

    // labels for the field listed
    labels: PropTypes.object,
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    const { onChange } = this.props;
    const clean = {};

    this.getFieldValue()
      .split(',')
      .forEach(f => {
        clean[f] = (value || {})[f] || '';
      });

    onChange(clean);
  }

  onChangeField(field) {
    const { onChange } = this.props;
    const value = {};
    value[field] = null;

    onChange(value);
  }

  getField() {
    const { fields, value, defaultField } = this.props;
    const possibles = Object.keys(fields);

    for (let i = possibles.length - 1; i >= 0; i--) {
      if (value[possibles[i]] !== undefined) {
        return possibles[i];
      }
    }

    return defaultField || possibles[possibles.length - 1];
  }

  getFieldValue() {
    const { fields } = this.props;
    return fields[this.getField()];
  }

  getFieldOptions() {
    const { fields, labels, lang } = this.props;

    return Object.keys(fields)
      .map(f => {
        const label = labels[f];
        return {
          value: f,
          label: _.get(label, lang, label[_.first(_.keys(label))]),
        };
      });
  }

  render() {
    const { lang, res, value: pValue } = this.props;
    const selectStyles = {
      container: provided => ({
        ...provided,
        display: 'inline-block',
        width: '100px',
      }),
      control: provided => ({
        ...provided,
        borderRadius: '4px 0 0 4px',
        borderRight: 'none',
        background: '#eee',
      }),
      indicatorsContainer: () => ({
        display: 'none',
      }),
    };
    const options = this.getFieldOptions();
    const value = options.find(option => option.value === this.getField());

    return (
      <div className="picked-terms-selector">
        <Select
          styles={selectStyles}
          value={value}
          options={options}
          onChange={value => this.onChangeField(value ? value.value : value)}
          autoBlur
          clearable={false}
          searchable={false}
        />
        <TermSelector
          res={res}
          lang={lang}
          field={this.getFieldValue()}
          value={pValue[this.getField()]}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default TermSelectorPicker;
