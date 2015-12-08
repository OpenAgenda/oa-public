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

TimingsPicker = require( './TimingsPicker.jsx' ),

TagSelector = require( 'agenda-tags/lib/TagSelector.jsx' ),

CategorySelector = require( 'agenda-categories/lib/CategorySelector.jsx' ),

utils = require( 'utils' ),

update = require( 'react-addons-update' ),

formErrors = {};

module.exports = React.createClass( {

  getInitialState: function() {

    var state = this.props.initData;

    formErrors = state.errors || {};

    state.languages = this.props.initialLanguages;

    if ( !state.languages.length ) {

      state.languages = [ this.props.lang ];

    }

    if ( !state.custom ) state.custom = {};

    return state;
  },

  onChange: function( field ) {

    var self = this;

    return function( value, errorMessage ) {

      var updated = {};

      updated[ field ] = value;

      formErrors[ field ] = errorMessage;

      self.setState( updated );

      self.props.onTextChange( field, value, self.listErrorDetails( ) );

    }

  },

  changeCustom: function( field, value, errorMessage ) {

    var updated = {
      custom: JSON.parse( JSON.stringify( this.state.custom ) )
    };

    updated.custom[ field ] = value;

    formErrors[ field ] = errorMessage;

    this.setState( updated );

    this.props.onCustomChange( updated.custom , this.listErrorDetails( ) );

  },


  /**
   * generate events as list including for each error the message, the label of the field and its name
   */
  listErrorDetails: function() {

    var errors = [];

    for( var i in formErrors ) {

      if ( formErrors[ i ] ) errors.push( {
        field: i,
        label: this.getErrorFieldLabel( i )[ this.props.lang ],
        message: formErrors[ i ]
      });

    }

    return errors;

  },

  getErrorFieldLabel: function( field ) {

    if ( this.props.custom ) {

      var customPossibles = this.props.custom.filter( function( customField ) {

        return customField.name == field;

      });

      if ( customPossibles.length ) return customPossibles[ 0 ].label;

    }

    if ( field == 'freeText' ) return this.props.labels.longDescription;

    if ( field == 'tags' ) return this.props.labels.keywords;

    return this.props.labels[ field ];

  },

  onTimingsChange: function( values, errorMessage ) {

    var updated = {};

    updated.timings = values;

    formErrors.timings = errorMessage;

    this.setState( updated );

    this.props.onTimingsChange( values, this.listErrorDetails( ) );

  },

  onTagsCategoryChange: function( type ) {

    var self = this;

    return function( newData ) {

      var agendaIndex = self.getAgendaIndex(), 

      agendas = {};

      if ( agendaIndex == -1 ) {

        agendas = [ {
          uid:self.props.agendaUid,
          tags: type == 'tags' ? newData : [],
          category: type == 'category' ? newData : undefined
        } ];

        self.setState( { agendas: agendas } );

      } else {

        agendas[ agendaIndex ] = {};

        agendas[ agendaIndex ][ type ] = { $set : newData };

        self.setState( {
          agendas: update( self.state.agendas, agendas )
        } );

      }

      self.props.onAgendaDataChange( {
        uid: self.props.agendaUid,
        tags: self.stringifySlugs( type == 'tags' ? newData : ( agendaIndex == -1 ? [] : self.state.agendas[ agendaIndex ].tags ) ),
        category: self.stringifySlugs( type == 'category' ? newData : ( agendaIndex == -1 ? undefined : self.state.agendas[ agendaIndex ].category ) )
      } );

    }

  },

  stringifySlugs: function( data ) {

    if ( !data ) return;

    if ( utils.isArray( data ) ) {

      return data.map( function( d ) { return typeof d == 'object' ? d.slug : d } );

    } else {

      return ( typeof data == 'object' ? data.slug : data );

    }

  },

  getSelectedCategory: function() {

    var aIndex = this.getAgendaIndex();

    if ( aIndex == -1 ) return;

    var category = this.state.agendas[ aIndex ].category;

    if ( !category ) return;

    if ( typeof category == 'string' ) return { slug: category };

    return category

  },

  getSelectedTags: function() {

    var aIndex = this.getAgendaIndex();

    if ( aIndex == -1 ) return [];

    var tags = this.state.agendas[ aIndex ].tags;

    if ( !tags || !tags.length ) return [];

    if ( typeof tags[ 0 ] == 'string' ) {

      return tags.map( function( t ) { return { slug: t } } );

    }

    return tags;

  },

  getAgendaIndex: function() {

    var self = this,

    agendaIndex = -1;

    if ( !this.state.agendas ) return agendaIndex;

    this.state.agendas.forEach( function( agenda, i ) {

      if ( agenda.uid == self.props.agendaUid ) agendaIndex = i;

    } );

    return agendaIndex;

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
      error={ formErrors.freeText }
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

      { this.props.categories.length || ( this.props.categorySet && this.props.categorySet.categories.length ) ? <CategorySelector
        lang={this.props.lang}
        set={this.props.categorySet}
        categories={this.props.categories}
        selection={this.getSelectedCategory()}
        onChange={this.onTagsCategoryChange( 'category' )}
        labels={this.props.labels} /> : '' }

      { this.props.tags.length || ( this.props.tagSet && this.props.tagSet.groups.length ) ? <TagSelector
        lang={this.props.lang}
        set={this.props.tagSet}
        tags={this.props.tags}
        selection={this.getSelectedTags()}
        onChange={this.onTagsCategoryChange( 'tags' )}
        labels={this.props.labels} /> : '' }

      <div className="js_event_image_canvas"></div>

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
          error={formErrors.title }
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
          error={formErrors.description }
          languages={this.state.languages}
          onChange={this.onChange( 'description' )}
          lang={this.props.lang} /> 

        <EventKeywordsField
          constraints={{max: 255}}
          counter={true}
          value={this.state.tags}
          name='keywords'
          optional={true}
          languages={this.state.languages}
          onChange={this.onChange( 'tags' )}
          label={this.props.labels.keywords}
          error={formErrors.tags }
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
          error={formErrors.conditions }
          languages={this.state.languages}
          onChange={this.onChange( 'conditions' )}
          lang={this.props.lang} />  

        <TextField 
          label={this.props.labels.ticketLink}
          name='ticket_link'
          type="url"
          optional={true}
          value={this.state.ticketLink}
          error={formErrors.ticketLink}
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
        values={this.state.custom }
        errors={ formErrors }
        languages={this.state.languages}
        onChange={this.changeCustom}
        labels={this.props.labels}     
        res={this.props.customRes}   
        lang={this.props.lang} /></div>
      : '' }


      <div className="js_event_location_canvas"></div>


      <TimingsPicker
        labels={this.props.labels}
        lang={this.props.lang}
        error={formErrors.timings}
        timings={this.state.timings}
        onChange={this.onTimingsChange} />

      

    </div>;

  }

} );