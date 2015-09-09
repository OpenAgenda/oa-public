"use strict";

var React = require( 'react' ),

validators = require( './validators' ),

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

  onChange: function( e ) {

    var value = e.target.value;

    this.setState( { userHasTyped: true } );

    this.props.onChange( value, this.validate( value ) );

  },

  renderField: function() {

    if ( this.props.type !== 'textarea' ) {

      return <input type="text" value={this.props.value ? this.props.value : ''} onChange={this.onChange}/>;

    } else {

      return <textarea value={this.props.value} onChange={this.onChange}/>

    }

  },

  render: function() {

    return <ul className="cform">
      <li>
        <label>{this.props.label[this.props.labelsLang]}{ this.props.optional ? '' : ' (*)' }</label>
        { this.props.info?<span className="info">{ this.props.info[ this.props.labelsLang ] }</span>:'' }
      </li>
      <li>
        { this.renderField() }
        { this.props.error && this.state.userHasTyped ? <span className="error">{this.props.error}</span> : '' }
      </li>
    </ul>

  },

  validate: function( value ) {

    var messages = errors.messages( this.props.labelsLang ),

    constraints = this.props.constraints || {};

    if ( value === undefined ) value = '';

    if ( ( value === null ) ) value = '';

    if ( !( value + '').length ) {

      if ( !this.props.optional ) {

        return messages.notEmpty();

      }

      return false;

    }

    if ( ( constraints.max !== undefined ) && ( value.length > constraints.max ) ) {

      return messages.tooLong( constraints.max );

    }

    if ( ( constraints.min !== undefined ) && ( value.length < constraints.min ) ) {

      return messages.tooShort( constraints.min );

    }

    if ( typeValidators[ this.props.type ] && !typeValidators[ this.props.type ].func( value ) ) {

      return messages[ typeValidators[ this.props.type ].error ]();

    }

    return false;

  }

});