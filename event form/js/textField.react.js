"use strict";

var React = require( 'react' ),

validators = require( './validators' ),

ERR = {
  NOTINT: 0,
  NOTEMPTY: 1,
  TOOLONG: 2,
  TOOSHORT: 3
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

    if ( [ 'integer', 'text' ].indexOf( this.props.type ) !== -1 ) {

      return <input type="text" value={this.props.value} onChange={this.onChange}/>;

    } else {

      return <textarea value={this.props.value} onChange={this.onChange}/>

    }

  },

  render: function() {

    return ( 
      <li>
        <label>{this.props.field.label[this.props.lang]}{this.props.field.optional ? '' : ' (*)'}</label>
        {this.renderField()}
        { this.props.error && this.state.userHasTyped ? <span className="error">{this.props.error}</span> : '' }
        { this.props.field.info && !( this.props.error && this.state.userHasTyped ) ? <span className="info">{this.props.field.info}</span> : '' }
      </li>
    );

  },

  validate: function( value ) {

    if ( value === undefined ) value = '';

    if ( !this.props.optional && !( value + '').length ) {

      return this.message( ERR.NOTEMPTY );

    }

    if ( ( this.props.field.max !== undefined ) && ( value.length > this.props.field.max ) ) {

      return this.message( ERR.TOOLONG, this.props.field.max );

    }

    if ( ( this.props.field.min !== undefined ) && ( value.length < this.props.field.min ) ) {

      return this.message( ERR.TOOSHORT, this.props.field.min );

    }


    // validate integer type
    if ( ( this.props.type == 'integer' ) && !validators.isInteger( value ) ) {

      return this.message( ERR.NOTINT )

    }

    return false;

  },

  message: function( code, value ) {

    var messages = {}, message;

    messages[ ERR.NOTINT ] = {
      en: 'the value must be an integer',
      fr: 'la valeur doit être un entier'
    };

    messages[ ERR.NOTEMPTY ] = {
      en: 'this field cannot be empty',
      fr: 'ce champ ne peux pas rester vide'
    };

    messages[ ERR.TOOLONG ] = {
      en: 'this value cannot exceed %s characters',
      fr: 'cette valeur ne doit pas exceder %s caractères'
    }

    messages[ ERR.TOOSHORT ] = {
      en: 'this value should be at least %s characters long',
      fr: 'cette valeur doit au minimum avoir %s caractères'
    }

    message = messages[ code ][ this.props.lang ];

    if ( value !== undefined ) {

      message = message.replace( '%s', value );

    }

    return message;

  }

});