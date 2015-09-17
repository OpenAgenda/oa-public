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

    if ( !state.languages.length ) {

      state.languages = [ this.props.lang ];

    }

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

  renderFreeTextField: function() {

    return <MultilingualTextField
      placeholder={this.props.labels.longDescriptionPlaceholder}
      name='long_description'
      counter={true}
      constraints={{max: 10000}}
      optional={true}
      label={this.props.labels.longDescription}
      type='textarea'
      rows={10}
      value={this.state.freeText}
      error={this.state.errors.freeText }
      languages={this.state.languages}
      onChange={this.onChange( 'freeText' )}
      lang={this.props.lang} /> 

  },

  renderMarkdownField: function() {

    return <WysiwygMarkdown
      name='long_description'
      markdown={this.state.freeText}
      languages={this.state.languages}
      onChange={this.onChange( 'freeText' )}
      labels={this.props.labels}
      lang={this.props.lang} />;

  },

  render: function() {

    return <div>

      <h2>{this.props.labels.descriptionSection[ this.props.lang ]}</h2>

      <LanguageBar 
        languages={ this.state.languages } 
        onChangeLanguages={ this.changeLanguages }
        labels={ this.props.labels } />

      <div className="form-section">

        <MultilingualTextField
          constraints={{max: 140}}
          counter={true}
          optional={false}
          label={this.props.labels.title}
          name='title'
          type='text'
          value={this.state.title}
          error={this.state.errors.title }
          languages={this.state.languages}
          onChange={this.onChange( 'title' )}
          lang={this.props.lang} />

        <MultilingualTextField
          constraints={{max: 200}}
          counter={true}
          optional={false}
          label={this.props.labels.description}
          name='description'
          type='text'
          value={this.state.description}
          error={this.state.errors.description }
          languages={this.state.languages}
          onChange={this.onChange( 'description' )}
          lang={this.props.lang} /> 

        <EventKeywordsField
          constraints={{max: 255}}
          counter={true}
          tags={this.state.tags}
          name='keywords'
          optional={true}
          languages={this.state.languages}
          onChange={this.onChange( 'tags' )}
          label={this.props.labels.keywords}
          error={this.state.errors.tags }
          placeholder={this.props.labels.keywordPlaceholder}
          lang={this.props.lang} />

        { this.props.useWysiwyg ? this.renderMarkdownField() : this.renderFreeTextField() }

        <MultilingualTextField
          constraints={{max: 255}}
          counter={true}
          label={this.props.labels.conditions}
          placeholder={this.props.labels.conditionsPlaceholder }
          name='conditions'
          type='text'
          optional={true}
          value={this.state.conditions}
          error={this.state.errors.conditions }
          languages={this.state.languages}
          onChange={this.onChange( 'conditions' )}
          lang={this.props.lang} />  

        <TextField 
          label={this.props.labels.ticketLink}
          name='ticket_link'
          type="url"
          optional={true}
          value={this.state.ticketLink}
          error={this.state.errors.ticketLink}
          onChange={this.onChange( 'ticketLink' )}
          lang={this.props.lang} />

        <AccessibilityFields
          value={this.state.accessibility || []}
          label={this.props.labels.accessibility}
          onChange={this.onChange( 'accessibility' )} 
          labelsLang={this.props.lang} />

        <AgeFields
          value={ this.state.age }
          label={ this.props.labels.age }
          onChange={ this.onChange( 'age' ) }
          labelsLang={ this.props.lang } />

      </div>

      { this.props.custom ? <div className="form-section"><CustomFields
        fields={ this.props.custom }
        values={this.state.custom || {} }
        errors={ this.state.errors || {} }
        languages={this.state.languages}
        onChange={this.changeCustom}
        label={this.props.labels}
        lang={this.props.lang} /></div>
      : '' }

    </div>;

  }

} );