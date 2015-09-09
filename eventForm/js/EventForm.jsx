"use strict";

var React = require( 'react' ),

LanguageBar = require( './LanguageBar.jsx' ),

TextField = require( './TextField.jsx' ),

MultilingualTextField = require( './MultilingualTextField.jsx' ),

EventKeywordsField = require( './EventKeywordsField.jsx' ),

WysiwygMarkdown = require( './WysiwygMarkdown.jsx' ),

CustomFields = require( './CustomFields.jsx' ),

AccessibilityFields = require( './AccessibilityFields.jsx' ),

AgeFields = require( './AgeFields.jsx' ),

utils = require( 'utils' );

module.exports = React.createClass( {

  getInitialState: function() {

    var state = this.props.initData;

    state.errors = state.errors || {};

    state.languages = this.props.initialLanguages;

    return state;
  },

  onChange: function( field ) {

    var self = this;

    return function( value, errors ) {

      var updated = {};

      updated[ field ] = value;

      updated.errors = JSON.parse( JSON.stringify( self.state.errors ) );

      if ( errors ) {

        updated.errors[ field ] = errors;

      } else if ( updated.errors[ field ] ) {

        delete updated.errors[ field ];

      }

      self.props.onTextChange( field, value );

      self.setState( updated );

    }

  },

  changeCustom: function( values, errors ) {

    var updatedErrors = utils.extend( JSON.parse( JSON.stringify( this.state.errors ) ), errors );

    this.props.onCustomChange( values, updatedErrors );

    this.setState( {
      custom: values,
      errors: updatedErrors
    } );

  },

  changeLanguages: function( languages ) {

    this.setState( {
      languages: languages
    } );

  },

  render: function() {

    return <div>

      <LanguageBar 
        languages={ this.state.languages } 
        onChangeLanguages={ this.changeLanguages }
        labels={ this.props.labels } />

    </div>;

  }

} );