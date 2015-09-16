"use strict";

var React = require( 'react' ),

validators = require( './validators' ),

utils = require( 'utils' ),

renderHelpers = require( './renderHelpers.jsx' );

module.exports = React.createClass({

  getInitialState: function() {

    return {
      userHasTyped: false
    };

  },

  componentDidUpdate: function() {

    var value;

    if ( typeof this.props.value === 'string' ) {

      value = this.convertToMultilingual( this.props.value );

      this.props.onChange( value, this.validate( value ) );

    }

  },

  convertToMultilingual: function( v ) {

    var m = {};

    utils.forEach( this.props.languages, function( language ) {

      m[ language ] = v;

    });

    return m;

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

  validate: validators.validate

});