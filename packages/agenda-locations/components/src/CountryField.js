import React, { Component } from 'react';
import Select from 'react-select';

import countries from '@openagenda/countries/labels';

// module.exports = createReactClass({
//   getDefaultProps() {
//     return {
//       enabled: true,
//     };
//   },

//   extractCountryNames() {
//     return countries.map(c => {
//       return {
//         value: c.code,
//         label: c[this.props.lang],
//       };
//     });
//   },

//   onChange(code) {
//     this.props.onChange('countryCode', code);
//   },

//   render() {
//     const options = this.extractCountryNames();
//     const value = options.find(option => option.value === this.props.value);

//     const selectStyles = {
//       menu: provided => ({
//         ...provided,
//         zIndex: 1042,
//       }),
//     };

//     return (
//       <div
//         className={
//           this.props.enabled
//             ? 'form-group country'
//             : 'form-group country disabled'
//         }
//       >
//         <label>{this.props.getLabel('country')}</label>
//         <Select
//           styles={selectStyles}
//           disabled={!this.props.enabled}
//           options={options}
//           value={value}
//           onChange={value => this.onChange(value ? value.value : value)}
//           clearable={false}
//         />
//       </div>
//     );
//   },
// });

//----------------------------------------------------------------------------------------------------------------------------------

const defaultProps = {
  enabled: true,
};

class CountryField extends Component {
  onChange(code) {
    const { onChange } = this.props;
    onChange('countryCode', code);
  }

  extractCountryNames() {
    const { lang } = this.props;
    return countries.map(c => {
      return {
        value: c.code,
        label: c[lang],
      };
    });
  }

  render() {
    const options = this.extractCountryNames();
    const value = options.find(option => option.value === this.props.value);

    const selectStyles = {
      menu: provided => ({
        ...provided,
        zIndex: 1042,
      }),
    };

    return (
      <div
        className={
          this.props.enabled
            ? 'form-group country'
            : 'form-group country disabled'
        }
      >
        <label>{this.props.getLabel('country')}</label>
        <Select
          styles={selectStyles}
          disabled={!this.props.enabled}
          options={options}
          value={value}
          onChange={value => this.onChange(value ? value.value : value)}
          clearable={false}
        />
      </div>
    );
  }
}

CountryField.defaultProps = defaultProps;

export default CountryField;
