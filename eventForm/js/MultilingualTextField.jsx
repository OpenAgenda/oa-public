"use strict";

var React = require( 'react' ),

validators = require( './validators' ),

utils = require( 'utils' ),

errors = require( './errors' ),

renderHelpers = require( './renderHelpers.jsx' );

module.exports = React.createClass({

  getInitialState: function() {

    return {
      userHasTyped: false
    };

  },

  onChange: function( l ) {

    var self = this;

    return function( e ) {

      var value = JSON.parse( JSON.stringify( self.props.value || {} ) );

      value[ l ] = e.target.value;

      self.setState( { userHasTyped: true } );

      self.props.onChange( value, self.validate( value ) );

    }

  },

  renderBlock: renderHelpers.multilingual.block,

  renderField: function( value, l ) {

    if ( this.props.type !== 'textarea' ) {

      return <input type="text" value={ value } onChange={ this.onChange( l ) }/>

    } else {

      return <textarea rows={ this.props.rows } value={ value } onChange={ this.onChange( l ) }/>

    }    

  },

  renderError: renderHelpers.multilingual.error,

  render: renderHelpers.multilingual.render,

  validate: function( value ) {

    var currentMessages = {},

    messages = errors.messages( this.props.lang ),

    self = this,

    has = false;

    this.props.languages.forEach( function( l ) {

      var v = value[ l ] || '',

      message;

      if ( !v.length && self.props.optional===false ) {

        message = messages.notEmpty();

      } else if ( ( self.props.constraints.max !== undefined ) && ( v.length > self.props.constraints.max ) ) {

        message = messages.tooLong( self.props.constraints.max );

      } else if ( ( self.props.constraints.min !== undefined ) && ( v.length < self.props.constraints.min ) ) {

        message = messages.tooShort( self.props.constraints.min );

      }

      if ( message ) {

        currentMessages[ l ] = message;

        has = true;

      }

    });

    return has ? currentMessages : false;

  }

});