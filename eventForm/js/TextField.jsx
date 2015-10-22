"use strict";

var React = require( 'react' ),

validators = require( './validators' ),

renderHelpers = require( './renderHelpers.jsx' ),

errors = require( './errors' ),

utils = require( 'utils' ),

typeValidators = {
  integer: { func: validators.isInteger, error: 'notInt' },
  number: { func: validators.isNumber, error: 'notNum' },
  email: { func: validators.isEmail, error: 'notEmail' },
  url: { func: validators.isUrl, error: 'notURL' }
};

module.exports = React.createClass({

  getInitialState: function() {

    return {
      userHasTyped: false
    };

  },

  componentDidMount: function() {

    // need to validate data on mount
    this.props.onChange( this.props.value || '', this.validate( this.props.value || '' ) );

  },

  onChange: function( e ) {

    var value = e.target.value;

    this.setState( { userHasTyped: true } );

    this.props.onChange( value, this.validate( value ) );

  },

  renderField: function() {

    if ( this.props.type !== 'textarea' ) {

      return <input 
        name={this.props.name}
        type="text"
        value={this.props.value ? this.props.value : ''} 
        onChange={this.onChange}/>;

    } else {

      return <textarea 
        name={this.props.name}
        value={this.props.value} 
        onChange={this.onChange} />

    }

  },

  render: function() {

    return <ul className="cform">
      <li>
        <label>{this.props.label[this.props.lang]}{ this.props.optional ? '' : ' (*)' }</label>
        {renderHelpers.errorOrInfo.apply( this )}
        { this.renderField() }
      </li>
    </ul>

  },

  validate: function( value ) {

    var messages = errors.messages( this.props.lang ),

    constraints = this.props.constraints || {},

    error = {
      field: this.props.name,
      label: this.props.label[ this.props.lang ]
    };

    if ( value === undefined ) value = '';

    if ( ( value === null ) ) value = '';

    if ( !( value + '' ).length ) {

      if ( !this.props.optional ) {

        error.message = messages.notEmpty();

        return error;

      }

      return false;

    }

    if ( ( constraints.max !== undefined ) && ( value.length > constraints.max ) ) {

      error.message = messages.tooLong( constraints.max );

      return error;

    }

    if ( ( constraints.min !== undefined ) && ( value.length < constraints.min ) ) {

      error.message = messages.tooShort( constraints.min );

      return error;

    }

    if ( typeValidators[ this.props.type ] && !typeValidators[ this.props.type ].func( value ) ) {

      error.message = messages[ typeValidators[ this.props.type ].error ]();

      return error;

    }

    return false;

  }

});