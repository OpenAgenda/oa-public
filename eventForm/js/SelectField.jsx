"use strict";

var React = require( 'react' ),

RadioTypeField = require( './RadioTypeField.jsx' ),

Select = require( 'react-select' );

module.exports = RadioTypeField( {

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

    return <Select
      value={this.props.value}
      options={this.getOptions()}
      onChange={obj => this.onChange( obj.value )}
      clearable={false} />

  }

} );