"use strict";

var React = require( 'react' ),

RadioTypeField = require( './RadioTypeField.jsx' );

module.exports = RadioTypeField( {

  isChecked: function( option ) {

    if ( this.props.type == 'radio' ) {

      return option.value == this.props.value;

    } else {

      return this.props.value.indexOf( option.value ) !== -1;

    }

  },

  renderField() {

    return <div className="form-group">
      <ul className="list-unstyled">
        { this.props.field.options.map( (option, i) => <li key={i} className={this.props.type}>
          <label>
            <input 
              type={this.props.type}
              name={this.props.field.name}
              checked={this.isChecked( option )}
              onChange={this.onChange.bind( this, option.value )} /> {option.label[this.props.lang]}
            </label>
        </li> ) }
      </ul>
    </div>

  }

} );