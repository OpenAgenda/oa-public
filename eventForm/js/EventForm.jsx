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

    this.props.onChangeLanguages( languages );

  },

  render: function() {

    return <div>

      <LanguageBar 
        languages={ this.state.languages } 
        onChangeLanguages={ this.changeLanguages }
        labels={ this.props.labels } />

      <MultilingualTextField
        constraints={{max: 140}}
        optional={false}
        label={this.props.labels.title}
        type='text'
        value={this.state.title}
        error={this.state.errors.title }
        languages={this.state.languages}
        onChange={this.onChange( 'title' )}
        labelsLang={this.props.language} />

      <MultilingualTextField
        constraints={{max: 200}}
        optional={false}
        label={this.props.labels.description}
        type='text'
        value={this.state.description}
        error={this.state.errors.description }
        languages={this.state.languages}
        onChange={this.onChange( 'description' )}
        labelsLang={this.props.language} /> 

      <EventKeywordsField
        tags={this.state.tags}
        languages={this.state.languages}
        onChange={this.onChange( 'tags' )}
        labels={this.props.labels} />

      <WysiwygMarkdown
        markdown={this.state.freeText}
        languages={this.state.languages}
        onChange={this.onChange( 'freeText' )}
        labels={this.props.labels} />

      <MultilingualTextField
        constraints={{max: 255}}
        label={this.props.labels.conditions}
        type='text'
        optional={true}
        value={this.state.conditions}
        error={this.state.errors.conditions }
        languages={this.state.languages}
        onChange={this.onChange( 'conditions' )}
        labelsLang={this.props.language} />  

      <TextField 
        label={this.props.labels.ticketLink}
        type="url"
        optional={true}
        value={this.state.ticketLink}
        error={this.state.errors.ticketLink}
        onChange={this.onChange( 'ticketLink' )}
        labelsLang={this.props.language} />

      <AccessibilityFields 
        value={this.state.accessibility || []}
        label={this.props.labels.accessibility}
        onChange={this.onChange( 'accessibility' )} 
        labelsLang={this.props.language} />

      <AgeFields
        value={ this.state.age || {} }
        label={ this.props.labels.age }
        onChange={ this.onChange( 'age' ) }
        labelsLang={ this.props.language } />

      { this.props.custom ? <CustomFields
        fields={ JSON.parse( this.props.custom ) }
        values={this.state.custom || {} }
        errors={ this.state.errors || {} }
        languages={this.state.languages}
        onChange={this.changeCustom}
        label={this.props.labels}
        labelsLang={this.props.language} />
      : '' }

    </div>;

  }

} );