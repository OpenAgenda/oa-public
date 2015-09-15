"use strict";

var React = require( 'react' ),

validators = require( './validators' ),

ERR = {
  NOTEMPTY: 1
}

module.exports = React.createClass({

  getInitialState: function() {

    return {
      userHasTyped: false
    };

  },

  componentDidMount: function() {

    this.update( this.props.value );

  },

  onChange: function( value ) {

    this.setState( { userHasTyped: true } );

    this.update( value );

  },

  update: function( value ) {

    this.props.handleUpdate( 
      value, 
      this.validate( value )
    );

  },

  render: function() {

    var self = this,

    renderOption = function( option ) {

      return <li>
        <input type="radio" name={self.props.field.name} checked={option.value==self.props.value} onChange={self.onChange.bind( self, option.value )} />
        <label>{option.label[self.props.lang]}</label>
      </li>;

    };

    return ( 
      <ul className="cform">
        <li>
          <label>{this.props.field.label[this.props.lang]}{this.props.field.optional ? '' : ' (*)'}</label>
        </li>
        {this.props.field.options.map( renderOption )}
        { this.props.error && this.state.userHasTyped ? <li><span className="error">{this.props.error}</span></li> : '' }
      </ul>
    );

  },

  validate: function( value ) {

    if ( value === undefined ) value = '';

    if ( !this.props.optional && !( value + '').length ) {

      return this.message( ERR.NOTEMPTY );

    }

    return false;

  },

  message: function( code ) {

    var messages = {};

    messages[ ERR.NOTEMPTY ] = {
      en: 'this field cannot be empty',
      fr: 'ce champ ne peux pas rester vide'
    };

    return messages[ code ][ this.props.lang ];

  }

});