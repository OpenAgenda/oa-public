"use strict";

const React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),
  
  validators = require( './validators' ),
  
  renderHelpers = require( './renderHelpers.jsx' ),
  
  errors = require( './errors' ),
  
  utils = require( '@openagenda/utils' ),
  
  typeValidators = {
    integer: { func: validators.isInteger, error: 'notInt' },
    number: { func: validators.isNumber, error: 'notNum' },
    email: { func: validators.isEmail, error: 'notEmail' },
    url: { func: validators.isUrl, error: 'notURL' }
  },
  
  typeCleaners = {
    integer: trim,
    number: trim,
    email: trim,
    url: trim
  };

function trim( v ) {

  return v.trim();

}

module.exports = createReactClass({

  getInitialState: function() {

    return {
      userHasTyped: false
    };

  },

  componentDidMount: function() {

    // need to validate data on mount
    this.props.onChange( this.props.value || '', this.validate( this.props.value || '' ) );

  },

  onChange: function( e ) {

    var value = e.target.value;

    if ( typeCleaners[ this.props.type ] ) {

      value = typeCleaners[ this.props.type ]( value );

    }

    this.setState( { userHasTyped: true } );

    this.props.onChange( value, this.validate( value ) );

  },

  renderField: function() {

    if ( this.props.type !== 'textarea' ) {

      return <input 
        name={this.props.name}
        className="form-control"
        placeholder={this.props.placeholder ? this.props.placeholder[ this.props.lang ] : null}
        type="text"
        value={this.props.value ? this.props.value : ''} 
        onChange={this.onChange}/>;

    } else {

      return <textarea
        className="form-control"
        placeholder={this.props.placeholder ? this.props.placeholder[ this.props.lang ] : null}
        rows="4" 
        name={this.props.name}
        value={this.props.value} 
        onChange={this.onChange} />

    }

  },

  render: function() {

    return <div className="form-group">
      <label>{this.props.label[this.props.lang]}{ this.props.optional ? '' : ' (*)' }</label>
      {renderHelpers.renderInfo.apply( this )}
      { this.renderField() }
      { renderHelpers.renderError.apply( this ) }
    </div>

  },

  validate: function( value ) {

    var messages = errors.messages( this.props.lang ),

    constraints = this.props.constraints || {};

    if ( value === undefined ) value = '';

    if ( ( value === null ) ) value = '';

    if ( !( value + '' ).length ) {

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
