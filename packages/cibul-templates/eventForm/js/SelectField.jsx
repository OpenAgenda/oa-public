import React from 'react';
import RadioTypeField from './RadioTypeField.jsx';
import Select from 'react-select';

export default RadioTypeField( {

  getOptions: function() {

    var self = this;

    return this.props.field.options.map( function( o ) {

      return {
        value: o.value,
        label: o.label[ self.props.lang ]
      }

    });

  },

  renderField: function() {

    const options = this.getOptions();

    return <Select
      value={options.find(option => option.value === this.props.value)}
      options={options}
      onChange={obj => this.onChange( obj.value )}
      clearable={false} />

  }

} );
