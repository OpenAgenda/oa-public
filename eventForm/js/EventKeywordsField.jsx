"use strict";

var React = require( 'react' ),

TagsInput = require( 'react-tagsinput' ),

renderHelpers = require( './renderHelpers.jsx' ),

validators = require( './validators' );

module.exports = React.createClass( {

  getInitialState: function() {

    return {
      userHasTyped: false
    };

  },

  stringify: function( tArr ) {

    return tArr.join( ', ' );

  },

  parse: function( tString ) {

    return ( typeof tString == 'undefined' ? '' : tString ).split( ',' ).filter( function( s ) {

      return !!s.length;

    } ).map( function( t ) {

      return t.trim( '' );

    });

  },

  onChange: function( l ) {

    var self = this;

    return function( lTags ) {

      var tags = JSON.parse( JSON.stringify( self.props.tags || {} ) );

      self.setState( { userHasTyped: true } );

      tags[ l ] = self.stringify( lTags );

      self.props.onChange( tags, self.validate( tags ) );

    }

  },

  renderBlock: renderHelpers.multilingual.block,

  renderError: renderHelpers.multilingual.error,

  renderField: function( value, l ) {

    return <TagsInput 
      value= { this.parse( this.props.tags ? this.props.tags[ l ] : '' ) }
      placeholder= {this.props.placeholder[ this.props.lang ] }
      onChange={ this.onChange( l ) }
      ref='tags' />

  },

  render: renderHelpers.multilingual.render,

  validate: validators.validate

} );