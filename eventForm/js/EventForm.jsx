"use strict";

var React = require( 'react' ),

LanguageBar = require( './LanguageBar.jsx' ),

EventTextField = require( './EventTextField.jsx' ),

EventKeywordsField = require( './EventKeywordsField.jsx' ),

WysiwygMarkdown = require( './WysiwygMarkdown.jsx' ),

CustomFields = require( './CustomFields.jsx' );

module.exports = React.createClass( {

  getInitialState: function() {

    var state = this.props.initData;

    state.languages = this.props.initialLanguages;

    return state;
  },

  changeText: function( field ) {

    var self = this;

    return function( value ) {

      var updated = {};

      updated[ field ] = value;

      self.props.onTextChange( field, value );

      self.setState( updated );

    }

  },

  changeCustom: function( value ) {

    console.log( value );

    this.props.onCustomChange( value );

    //this.setState( { custom: value } );

  },

  changeLanguages: function( languages ) {

    this.setState( {
      languages: languages
    } );

  },

  render: function() {

    return <div>

      <LanguageBar 
        languages={this.state.languages} 
        onChangeLanguages={this.changeLanguages}
        labels={this.props.labels} />

      { this.props.custom ? <CustomFields
        fields={ JSON.parse( this.props.custom )}
        values={this.state.custom}
        languages={this.state.languages}
        onChange={this.changeCustom}
        label={this.props.labels}
        labelsLang='fr' />
      : '' }


    </div>;

  }

} );