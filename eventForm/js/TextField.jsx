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

  componentDidMount: function() {

    this.update( this.props.value );

  },

  onChange: function( e ) {

    this.setState( { userHasTyped: true } );

    this.update( e.target.value );

  },

  update: function( value ) {

    this.props.handleUpdate( 
      value, 
      this.validate( value )
    );

  },

  renderField: function() {

    if ( [ 'integer', 'text', 'number', 'email', 'url' ].indexOf( this.props.type ) !== -1 ) {

      return <input type="text" value={this.props.value ? this.props.value : ''} onChange={this.onChange}/>;

    } else {

      return <textarea value={this.props.value} onChange={this.onChange}/>

    }

  },

  render: function() {

    return <ul className="cform">
      <li>
        <label>{this.props.label[this.props.labelsLang]}{ this.props.field.optional ? '' : ' (*)' }</label>
        { this.props.info?<span className="info">{ this.props.info[ this.props.labelsLang ] }</span>:'' }
      </li>
      <li>
        { this.renderField() }
        { this.props.error && this.state.userHasTyped ? <span className="error">{this.props.error}</span> : '' }
      </li>
    </ul>

  },

  validate: function( value ) {

    var messages = errors.messages( this.props.labelsLang );

    if ( value === undefined ) value = '';

    if ( ( value === null ) ) value = '';

    if ( !( value + '').length ) {

      if ( !this.props.field.optional ) {

        return messages.notEmpty();

      }

      return false;

    }

    if ( ( this.props.field.max !== undefined ) && ( value.length > this.props.field.max ) ) {

      return messages.tooLong( this.props.field.max );

    }

    if ( ( this.props.field.min !== undefined ) && ( value.length < this.props.field.min ) ) {

      return messages.tooShort( this.props.field.min );

    }

    if ( typeValidators[ this.props.type ] && !typeValidators[ this.props.type ].func( value ) ) {

      return messages[ typeValidators[ this.props.type ].error ]();

    }

    return false;

  }

});