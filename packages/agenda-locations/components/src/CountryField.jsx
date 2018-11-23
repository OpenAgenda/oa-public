import createReactClass from 'create-react-class';
import React from 'react';
import Select from 'react-select';

import countries from '@openagenda/countries/labels.js';

module.exports = createReactClass( {

  getDefaultProps() {

    return {
      enabled: true
    }

  },

  extractCountryNames() {

    return countries.map( c => {

      return {
        value: c.code,
        label: c[ this.props.lang ]
      }

    } );

  },

  onChange( code ) {

    this.props.onChange( 'countryCode', code );

  },

  render() {

    return <div className={ this.props.enabled ? 'form-group country' : 'form-group country disabled' }>
      <label>{this.props.getLabel( 'country' )}</label>
      <Select
        disabled={!this.props.enabled}
        value={this.props.value}
        options={this.extractCountryNames()}
        onChange={ value => this.onChange( value ? value.value : value ) }
        clearable={false} />
    </div>

  }

} );
