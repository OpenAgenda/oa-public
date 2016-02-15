"use strict";

var React = require( 'react' ),

TagsInput = require( 'react-tagsinput' ),

renderHelpers = require( './renderHelpers.jsx' ),

validators = require( './validators' );

module.exports = React.createClass( {

  getInitialState: function() {

    return {
      userHasTyped: false,
      currentInputs: {}
    };

  },

  stringify: function( tArr ) {

    return tArr.join( ', ' );

  },

  parse: function( tString ) {

    return ( typeof tString !== 'string' ? '' : tString ).split( ',' ).filter( function( s ) {

      return !!s.length;

    } ).map( function( t ) {

      return t.trim( '' );

    });

  },

  onChange: function( l ) {

    var self = this;

    return function( lTags ) {

      var tags = JSON.parse( JSON.stringify( self.props.value || {} ) );

      self.setState( { userHasTyped: true } );

      tags[ l ] = self.stringify( lTags );

      self.props.onChange( tags, self.validate( tags ) );

    }

  },

  onBlur: function( l ) {

    var self = this;

    return function() {

      var currentInputs = JSON.parse( JSON.stringify( self.state.currentInputs ) ),

      tags = JSON.parse( JSON.stringify( self.props.value || {} ) ),

      lTags = tags[ l ].split( ',' );

      if ( !currentInputs[ l ] || !currentInputs[ l ].length ) return;

      lTags.push( currentInputs[ l ] );

      currentInputs[ l ] = '';

      self.setState( { currentInputs: currentInputs } );

      tags[ l ] = self.stringify( lTags );

      self.props.onChange( tags, self.validate( tags ) );

    }

  },

  onInputChange: function( l ) {

    var self = this;

    return function( e ) {

      var currentInputs = JSON.parse( JSON.stringify( self.state.currentInputs ) ),

      hasComma = e.target.value.split( ',' ).length > 1;

      currentInputs[ l ] = e.target.value.split( ',' )[ 0 ];

      self.setState( { currentInputs: currentInputs } );

      if ( hasComma ) self.onBlur( l )(); 

    }

  },

  renderBlock: renderHelpers.multilingual.block,

  renderError: renderHelpers.multilingual.error,

  renderField: function( value, l ) {

    return <TagsInput 
      value= { this.parse( this.props.value ? this.props.value[ l ] : '' ) }
      inputProps={{
        placeholder: value.length ? '' : this.props.placeholder[ this.props.lang ], 
        className : 'react-tagsinput-input',
        onBlur: this.onBlur( l ),
        onChange: this.onInputChange( l ),
        value: this.state.currentInputs[ l ]
      }}
      onChange={ this.onChange( l ) }
      ref='tags' />

  },

  render: renderHelpers.multilingual.render,

  validate: validators.validate

} );