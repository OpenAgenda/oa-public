"use strict";

const React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  PropTypes = require( 'prop-types' ),

  LanguageBar = require( 'react-form-components/build/LanguageBar' ),

  Translation = require( 'react-form-components/build/Translation' ),

  TextField = require( './TextField.jsx' ),

  MultilingualTextField = require( './MultilingualTextField.jsx' ),

  EventKeywordsField = require( './EventKeywordsField.jsx' ),

  WysiwygMarkdown = require( './WysiwygMarkdown.jsx' ),

  CustomFields = require( './CustomFields.jsx' ),

  AccessibilityFields = require( './AccessibilityFields.jsx' ),

  AgeFields = require( './AgeFields.jsx' ),

  TimingsPicker = require( './TimingsPicker.jsx' ),

  TagSelector = require( 'agenda-tags/lib/TagSelector.jsx' ),

  LocationSelector = require( 'agenda-locations/components/build/LocationSelector' ),

  CategorySelector = require( 'agenda-categories/lib/CategorySelector.jsx' ),

  Registration = require( 'registration/lib/Registration.js' ),

  References = require( 'agenda-event-references/react/build/Editor' ),

  utils = require( 'utils' ),

  update = require( 'immutability-helper' ),

  languageUtils = require( './legacy/languageUtils' ),

  Modal = require( 'react-components/build/Modal' ),

  Spinner = require( 'react-components/build/Spinner' ),

  textFields = [ 'title', 'description', 'freeText', 'keywords', 'conditions' ],

  translator = require( './translator.js' ),

  translationLabels = require( 'labels/event/translation' ),

  eventFormLabels = require( 'labels/event/form' ),

  flattenLabels = require( 'labels/flatten' );



let formErrors = {},

  EventForm = EventFormFactory();

module.exports = EventForm;

module.exports.actionables = {

  beforeSubmit: function( cb ) {

    translator( cb );

  },

  onSubmit: function() {}

}

function EventFormFactory() {

  return createReactClass( {

    propTypes: {
      configuration: PropTypes.object
    },

    getDefaultProps: function() {

      return {
        configuration: {
          fields: [ {
            name: 'keywords',
            display: false
          }, {
            name: 'location',
            settings: false
          } ]
        },
        initTranslation: false
      }

    },

    getInitialState: function() {

      var state = this.props.initData;

      if ( this.props.configuration.field( 'description' ).fixed() ) {

        this.props.onTextChange( 'description', this.props.configuration.field( 'description' ).fixed(), [] );

      }

      formErrors = state.errors || {};

      state.languages = this.props.initialLanguages;

      if ( !state.languages.length ) {

        state.languages = [ this.props.lang ];

      }

      if ( !state.custom || utils.isArray( state.custom ) ) state.custom = {};

      state.locationMode = state.location ? 'show' : 'search';

      if ( this.props.initTranslation && this.props.initTranslation.enabled ) {

        state.translation = this.props.initTranslation;

        translator.init( this, this.props.initTranslation.options, textFields );

      }


      module.exports.actionables.onSubmit = this.onSubmitSpin;

      return state;

    },

    onSubmitSpin: function() {

      this.setState( { submitSpin: true } );

    },

    getLabel: function( name ) {

      return this.props.labels[ name ][ this.props.lang ];

    },

    onChange: function( field ) {

      return ( value, errorMessage, changedLanguages = [] ) => {

        let updated = {};

        updated[ field ] = value;

        formErrors[ field ] = errorMessage;

        if ( this.state.translation && this.state.translation.enabled && changedLanguages.length ) {

          let updatedTranslation = { sets: [] };

          this.state.translation.sets.forEach( ( s, i ) => {

            updatedTranslation.sets[ i ] = { checked: {
              $set: s.checked.filter( l => changedLanguages.indexOf( l ) == -1 )
            } }

          } );

          updated.translation = update( this.state.translation, updatedTranslation );

        }

        this.setState( updated );

        this.props.onTextChange( field, value, this.listErrorDetails( ) );

      }

    },

    onSwappedLanguage: function( languages, swapFrom, swapTo ) {

      var updated = {}, self = this;

      textFields.forEach( function( field ) {

        updated[ field ] = JSON.parse( JSON.stringify( self.state[ field ] || {} ) );

        updated[ field ][ swapTo ] = updated[ field ][ swapFrom ];

        updated[ field ][ swapFrom ] = undefined;

      } );

      updated.languages = languages;

      this.setState( updated );

      textFields.forEach( function( field ) {

        self.props.onTextChange( field, updated[ field ], self.listErrorDetails( ) );

      } );

    },

    onChangedLanguage: function( languages, changedLanguage, change ) {

      var updated = {}, self = this;

      textFields.forEach( function( field ) {

        updated[ field ] = JSON.parse( JSON.stringify( self.state[ field ] || {} ) );

        updated[ field ][ changedLanguage ] = change;

      } ); 

      updated.languages = languages;

      this.setState( updated );

      textFields.forEach( function( field ) {

        self.props.onTextChange( field, updated[ field ], self.listErrorDetails( ) );

      } );

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

      var errors = [], self = this;

      for( var i in formErrors ) {

        if ( utils.isArray( formErrors[ i ] ) ) {

          errors = errors.concat( formErrors[ i ].map( function( e ) {

            return {
              field: e.field,
              label: e.label,
              message: e.message[ self.props.lang ]
            }

          } ) );

        } else if ( formErrors[ i ] ) {

          errors.push( {
            field: i,
            label: this.getErrorFieldLabel( i )[ this.props.lang ],
            message: formErrors[ i ]  
          });

        }

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

    onLocationModeChange: function( newMode, initLocation ) {

      this.setState( {
        locationMode: newMode,
        location: initLocation
      } );

    },

    onLocationChange: function( newLocation, newMode ) {

      this.setState( {
        location: newLocation,
        locationMode: newMode
      } );

      this.props.onLocationChange( newLocation );

    },

    onTagsCategoryChange: function( type ) {

      var self = this;

      return function( newData, errors ) {

        var agendaIndex = self.getAgendaIndex(), 

        agendas = {};

        formErrors[ type ] = errors;

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
          category: self.stringifySlugs( type == 'category' ? newData : ( agendaIndex == -1 ? undefined : self.state.agendas[ agendaIndex ].category ) ),
          errors: self.listErrorDetails()
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

      var swapIndex, removedLanguage, addedLanguage, swapFrom, swapTo, self = this;

      if ( languageUtils.isSame( languages, this.state.languages ) ) {

        // nothing changed.
        return;

      }

      swapIndex = languageUtils.getSwapIndex( languages, this.state.languages );

      if ( swapIndex !== -1 ) {

        swapFrom = this.state.languages[ swapIndex ];

        swapTo = languages[ swapIndex ];

        return this.onSwappedLanguage( languages, swapFrom, swapTo );

      }

      if ( languages.length < this.state.languages.length ) {

        // a language was removed

        removedLanguage = this.state.languages.filter( function( l ) {

          return languages.indexOf( l ) == -1;

        } )[ 0 ];

        return this.onChangedLanguage( languages, removedLanguage );

      }


      // a language was added  
      addedLanguage = languages.filter( function( l ) {

        return self.state.languages.indexOf( l ) == -1;

      } )[ 0 ];

      this.onChangedLanguage( languages, addedLanguage, '' );

    },

    renderMarkdownField: function() {

      return <div className="multilingual-input-field">
        <WysiwygMarkdown
          label={ this.props.configuration.field( 'longDescription' ).getLabel( false, this.props.labels ) }
          placeholder={ this.props.configuration.field( 'longDescription' ).getPlaceholder( false, this.props.labels ) }
          name='long_description'
          markdown={this.state.freeText}
          languages={this.state.languages}
          onChange={this.onChange( 'freeText' )}
          labels={this.props.labels}
          lang={this.props.lang} />
        </div>

    },

    renderLocationSelector: function() {

      return <div className="form-section">
        <LocationSelector
          settings={this.props.configuration.field( 'location' ).settings}
          mode={this.state.locationMode}
          disableChange={this.props.configuration.field( 'location' ).disableChange}
          onChangeMode={this.onLocationModeChange}
          location={this.state.location}
          lang={this.props.lang}
          res={this.props.locationRes}
          onChange={this.onLocationChange} />
      </div>

    },

    render: function() {

      return <div>

        <div>

          { ( this.props.categories && this.props.categories.length ) || ( this.props.categorySet && this.props.categorySet.categories.length ) ? <CategorySelector
            lang={this.props.lang}
            set={this.props.categorySet}
            categories={this.props.categories}
            selection={this.getSelectedCategory()}
            onChange={this.onTagsCategoryChange( 'category' )}
            labels={this.props.labels} /> : '' }

          { ( this.props.tags && this.props.tags.length ) || ( this.props.tagSet && this.props.tagSet.groups.length ) ? <TagSelector
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
            onChange={ this.changeLanguages }
            getLabel={ this.getLabel } />

          <div className="multilingual-input-field">

            <MultilingualTextField
              constraints={{max: 140}}
              counter={true}
              optional={false}
              label={this.props.configuration.field( 'title' ).getLabel( false, this.props.labels )}
              name='title'
              type='text'
              value={this.state.title}
              error={formErrors.title }
              languages={this.state.languages}
              onChange={this.onChange( 'title' )}
              lang={this.props.lang} />

          </div>

          { !this.props.configuration.field( 'description' ).fixed() ? 
          <div className="multilingual-input-field">
            <MultilingualTextField
              constraints={{max: 200}}
              counter={true}
              optional={false}
              label={this.props.configuration.field( 'description' ).getLabel( false, this.props.labels )}
              name='description'
              type='text'
              value={this.state.description}
              error={formErrors.description }
              languages={this.state.languages}
              onChange={this.onChange( 'description' )}
              lang={this.props.lang} />
          </div>
          : null }

            { this.props.configuration.field( 'keywords' ).display() ?
            <div className="multilingual-input-field">
              <EventKeywordsField
                constraints={{max: 255}}
                counter={true}
                value={this.state.keywords}
                name='keywords'
                optional={true}
                languages={this.state.languages}
                onChange={this.onChange( 'keywords' )}
                label={this.props.labels.keywords}
                error={formErrors.keywords}
                placeholder={this.props.labels.keywordPlaceholder}
                lang={this.props.lang} /> 
            </div> : null }

            { this.renderMarkdownField() }

            <div className="multilingual-input-field">
              <MultilingualTextField
                constraints={{max: 255}}
                counter={true}
                label={ this.props.configuration.field( 'conditions' ).getLabel( false, this.props.labels ) }
                placeholder={ this.props.configuration.field( 'conditions' ).getPlaceholder( false, this.props.labels ) }
                name='conditions'
                type='text'
                optional={true}
                value={this.state.conditions}
                error={formErrors.conditions }
                languages={this.state.languages}
                onChange={this.onChange( 'conditions' )}
                lang={this.props.lang} />  
            </div>

            <Registration 
              lang={this.props.lang}
              value={this.state.ticketLink}
              onChange={this.onChange( 'ticketLink' )} />

            <AccessibilityFields
              value={this.state.accessibility || []}
              label={this.props.labels.accessibility}
              onChange={this.onChange( 'accessibility' )} 
              labelsLang={this.props.lang} />

            { this.props.configuration.field( 'age' ).display() ? <AgeFields
              value={ this.state.age }
              label={ this.props.labels.age }
              onChange={ this.onChange( 'age' ) }
              labelsLang={ this.props.lang } /> : null }

          </div>

          { this.props.custom ? <CustomFields
            fields={ this.props.custom }
            values={ this.state.custom }
            errors={ formErrors }
            languages={ this.state.languages }
            onChange={ this.changeCustom }
            labels={ this.props.labels }     
            res={ this.props.customRes }   
            lang={ this.props.lang } />
          : '' }

          { this.props.configuration.field( 'references' ).display( false ) ? <References 
            initUids={ this.state.references }
            res={ this.props.referenceRes }
            onChange={ this.props.onReferencesChange }
          /> : null }

          <div className="margin-v-lg">
            <h2>{ this.props.labels.locationSection[ this.props.lang ] }</h2>
            { this.state.locationMode === 'create' ? 
              <Modal disableBodyScroll={{true}} classNames={{
                overlay: 'popup-overlay big'
              }} onClose={ ()=>{ this.onLocationModeChange( 'search' ); } } >
                <h2>{this.getLabel( 'locationCreate' )}</h2>
                {this.renderLocationSelector()}
              </Modal>
            : this.renderLocationSelector() }
          </div>
          
          <div className="margin-v-lg">
            <TimingsPicker
              labels={this.props.labels}
              lang={this.props.lang}
              error={formErrors.timings}
              timings={this.state.timings}
              configuration={this.props.configuration.field( 'timings' ) }
              onChange={this.onTimingsChange} />
          </div>

          { this.state.translation ?  
          <div className="margin-v-lg">
            <Translation
              source={this.state.translation.source}
              sets={this.state.translation.sets}
              check={translator.change.bind( null, true )}
              uncheck={translator.change.bind( null, false )}
              sourceChange={translator.sourceChange.bind( null )}
              labels= {flattenLabels( translationLabels, this.props.lang )}
            /> 
          </div>
          : null }


          <div className="js_form_canvas_below"></div>

          {this.state.translation && this.state.translation.translating ? 
            <Spinner page={true} message={translationLabels.processingTranslation[ this.props.lang ]} /> 
          : null }

          {this.state.submitSpin ? 
            <Spinner page={true} message={this.state.translation && this.state.translation.timeouts ? translationLabels.savingPartialTranslation[ this.props.lang ] : null } /> 
          : null }

        </div>

    }

  } );

}