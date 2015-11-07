"use strict";

var React = require( 'react' ),

RadioTypeField = require( './RadioTypeField.jsx' );

module.exports = RadioTypeField( {

  renderField: function() {

    var self = this,

    renderOption = function( option ) {

      return <li>
        <input type="radio" name={self.props.field.name} checked={option.value==self.props.value} onChange={self.onChange.bind( self, option.value )} />
        <label>{option.label[self.props.lang]}</label>
      </li>;

    };

    return <ul>
      {this.props.field.options.map( renderOption )}
    </ul>;

  }

} );