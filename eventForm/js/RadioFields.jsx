"use strict";

var React = require( 'react' ),

RadioTypeField = require( './RadioTypeField.jsx' );

module.exports = RadioTypeField( {

  isChecked: function( option ) {

    if ( this.props.type == 'radio' ) {

      return option.value == this.props.value

    } else {

      return this.props.value.indexOf( option.value ) !== -1;

    }

  },

  renderField: function() {

    var self = this,

    renderOption = function( option ) {

      return <li>
        <input 
          type={self.props.type}
          name={self.props.field.name}
          checked={self.isChecked( option )}
          onChange={self.onChange.bind( self, option.value )} />
        <label>{option.label[self.props.lang]}</label>
      </li>;

    };

    return <ul>
      {this.props.field.options.map( renderOption )}
    </ul>;

  }

} );