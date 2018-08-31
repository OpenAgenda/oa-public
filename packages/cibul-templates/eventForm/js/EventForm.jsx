"use strict";

import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import React from 'react';
import update from 'immutability-helper';

import CategorySelector from '@openagenda/agenda-categories/lib/CategorySelector.jsx';
import flattenLabels from '@openagenda/labels/flatten';
import formLabels from '@openagenda/labels/event/form';
import LanguageBar from '@openagenda/react-form-components/build/LanguageBar';
import LocationSelector from '@openagenda/agenda-locations/components/build/LocationSelector';
import Modal from '@openagenda/react-components/build/Modal';
import References from '@openagenda/agenda-event-references/react/build/Editor';
import Registration from '@openagenda/registration/lib/Registration.js';
import Spinner from '@openagenda/react-components/build/Spinner';
import TagSelector from '@openagenda/agenda-tags/lib/TagSelector.jsx';
import Translation from '@openagenda/react-form-components/build/Translation'; // suspected missing key prop
import translationLabels from '@openagenda/labels/event/translation';

import AccessibilityFields from './AccessibilityFields.jsx';
import AgeFields from './AgeFields.jsx';
import CustomField from './CustomField.jsx';
import EventKeywordsField from './EventKeywordsField.jsx';
import languageUtils from './legacy/languageUtils';
import MultilingualTextField from './MultilingualTextField.jsx';
import SelectField from './SelectField.jsx';
import TextField from './TextField.jsx';
import TimingsPicker from './TimingsPicker.jsx';
import translator from './translator.js';
import Wysiwyg from './Wysiwyg.jsx';

const _ = {
  isArray: require( 'lodash/isArray' ),
  extend: require( 'lodash/extend' ),
  pick: require( 'lodash/pick' ),
  get: require( 'lodash/get' )
}

const textFields = [ 'title', 'description', 'freeText', 'keywords', 'conditions' ];


let formErrors = {},

  EventForm = EventFormFactory();

module.exports = EventForm;

module.exports.actionables = {

  beforeSubmit: function ( cb ) {

    translator( cb );

  },

  onSubmit: function () {
  }

}

function EventFormFactory() {

  return createReactClass( {

    propTypes: {
      configuration: PropTypes.object,
      contributionConfiguration: PropTypes.object
    },

    getDefaultProps: function () {

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
        contributionConfiguration: {
          allowLocationCreate: true
        },
        initTranslation: false,
        custom: []
      }

    },

    getInitialState: function () {

      var state = this.props.initData;

      if ( this.props.configuration.field( 'description' ).fixed() ) {

        this.props.onTextChange( 'description', this.props.configuration.field( 'description' ).fixed(), [] );

      }

      formErrors = state.errors || {};

      if ( this.props.initialLanguages.length ) {

        state.languages = this.props.initialLanguages;

      } else {

        state.languages = [ this.props.defaultFormLanguage || this.props.lang ];

      }

      if ( !state.custom || _.isArray( state.custom ) ) state.custom = {};

      state.locationMode = state.location ? 'show' : 'search';

      if ( this.props.initTranslation && this.props.initTranslation.enabled ) {

        state.translation = this.props.initTranslation;

        translator.init( this, this.props.initTranslation.options, textFields );

      }

      module.exports.actionables.onSubmit = this.onSubmitSpin;

      return state;

    },

    onSubmitSpin: function () {

      this.setState( { submitSpin: true } );

    },

    getLabel: function ( name ) {

      return this.props.labels[ name ][ this.props.lang ];

    },

    formatTranslationMessage: function() {

      const progress = _.get( this.state, 'translation.translationProgress' );

      if ( !progress ) return '';

      return '\n' + progress.map( lang => ( {
        en: 'English',
        fr: 'Français',
        it: 'Italiano', 
        es: 'Español',
        de: 'Deutsch'
      } )[ lang ] ).join( ' → ' )

    },

    onChange: function ( field ) {

      return ( value, errorMessage, changedLanguages = [] ) => {

        let updated = {};

        updated[ field ] = value;

        // console.log( 'EventForm.onChange', field, errorMessage );
        formErrors[ field ] = errorMessage;

        if ( this.state.translation && this.state.translation.enabled && changedLanguages.length ) {

          let updatedTranslation = { sets: [] };

          this.state.translation.sets.forEach( ( s, i ) => {

            updatedTranslation.sets[ i ] = {
              checked: {
                $set: s.checked.filter( l => changedLanguages.indexOf( l ) == -1 )
              }
            }

          } );

          updated.translation = update( this.state.translation, updatedTranslation );

        }

        this.setState( updated );

        this.props.onTextChange( field, value, this.listErrorDetails() );

      }

    },

    onCustomImageChange: function( field, value, error ) {

      if ( value ) {

        value = value.split( '/' ).pop(); // we just want the file name, not the full url

      }

      this.onCustomChange( field, value, error );

    },

    onSwappedLanguage: function ( languages, swapFrom, swapTo ) {

      var updated = {}, self = this;

      textFields.forEach( function ( field ) {

        updated[ field ] = JSON.parse( JSON.stringify( self.state[ field ] || {} ) );

        updated[ field ][ swapTo ] = updated[ field ][ swapFrom ];

        updated[ field ][ swapFrom ] = undefined;

      } );

      updated.languages = languages;

      this.setState( updated );

      textFields.forEach( function ( field ) {

        self.props.onTextChange( field, updated[ field ], self.listErrorDetails() );

      } );

    },

    onChangedLanguage: function ( languages, changedLanguage, change ) {

      var updated = {}, self = this;

      textFields.forEach( function ( field ) {

        updated[ field ] = JSON.parse( JSON.stringify( self.state[ field ] || {} ) );

        updated[ field ][ changedLanguage ] = change;

      } );

      updated.languages = languages;

      this.setState( updated );

      textFields.forEach( function ( field ) {

        self.props.onTextChange( field, updated[ field ], self.listErrorDetails() );

      } );

    },

    onChangeRegistration: function( value, errorMessage ) {

      if ( !this.props.configuration.field( 'registration' ).get( 'optional', true ) && ( value === null || !value.length ) ) {

        errorMessage = formLabels.required[ this.props.lang ];

      }

      this.onChange( 'ticketLink' )( value, errorMessage );

    },

    onCustomChange: function ( field, value, errorMessage ) {

      // console.log( 'EventForm.onCustomChange', field, errorMessage );

      var updated = {
        custom: JSON.parse( JSON.stringify( this.state.custom ) )
      };

      updated.custom[ field ] = value;

      formErrors[ field ] = errorMessage;

      this.setState( updated );

      this.props.onCustomChange( updated.custom, this.listErrorDetails() );

    },


    /**
     * generate events as list including for each error the message, the label of the field and its name
     */
    listErrorDetails: function () {

      // console.log( 'listErrorDetails, formErrors', formErrors );

      var errors = [], self = this;

      for ( var i in formErrors ) {

        if ( _.isArray( formErrors[ i ] ) ) {

          errors = errors.concat( formErrors[ i ].map( function ( e ) {

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
          } );

        }

      }

      return errors;

    },

    getErrorFieldLabel: function ( field ) {

      if ( this.props.custom ) {

        var customPossibles = this.props.custom.filter( function ( customField ) {

          return customField.name == field;

        } );

        if ( customPossibles.length ) return customPossibles[ 0 ].label;

      }

      if ( field == 'freeText' ) return this.props.labels.longDescription;

      if ( field == 'tags' ) return this.props.labels.keywords;

      return this.props.labels[ field ];

    },

    onTimingsChange: function ( values, errorMessage ) {

      var updated = {};

      updated.timings = values;

      formErrors.timings = errorMessage;

      this.setState( updated );

      this.props.onTimingsChange( values, this.listErrorDetails() );

    },

    onLocationModeChange: function ( newMode, initLocation ) {

      this.setState( {
        locationMode: newMode,
        location: initLocation
      } );

    },

    onLocationChange: function ( newLocation, newMode ) {

      this.setState( {
        location: newLocation,
        locationMode: newMode
      } );

      this.props.onLocationChange( newLocation );

    },

    onTagsCategoryChange: function ( type ) {

      var self = this;

      return function ( newData, errors ) {

        var agendaIndex = self.getAgendaIndex(),

          agendas = {};

        formErrors[ type ] = errors;

        if ( agendaIndex == -1 ) {

          agendas = [ {
            uid: self.props.agendaUid,
            tags: type == 'tags' ? newData : [],
            category: type == 'category' ? newData : undefined
          } ];

          self.setState( { agendas: agendas } );

        } else {

          agendas[ agendaIndex ] = {};

          agendas[ agendaIndex ][ type ] = { $set: newData };

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

    stringifySlugs: function ( data ) {

      if ( !data ) return;

      if ( _.isArray( data ) ) {

        return data.map( function ( d ) {
          return typeof d == 'object' ? d.slug : d
        } );

      } else {

        return ( typeof data == 'object' ? data.slug : data );

      }

    },

    getSelectedCategory: function () {

      var aIndex = this.getAgendaIndex();

      if ( aIndex == -1 ) return;

      var category = this.state.agendas[ aIndex ].category;

      if ( !category ) return;

      if ( typeof category == 'string' ) return { slug: category };

      return category

    },

    getSelectedTags: function () {

      var aIndex = this.getAgendaIndex();

      if ( aIndex == -1 ) return [];

      var tags = this.state.agendas[ aIndex ].tags;

      if ( !tags || !tags.length ) return [];

      if ( typeof tags[ 0 ] == 'string' ) {

        return tags.map( function ( t ) {
          return { slug: t }
        } );

      }

      return tags;

    },

    getAgendaIndex: function () {

      var self = this,

        agendaIndex = -1;

      if ( !this.state.agendas ) return agendaIndex;

      this.state.agendas.forEach( function ( agenda, i ) {

        if ( agenda.uid == self.props.agendaUid ) agendaIndex = i;

      } );

      return agendaIndex;

    },

    changeLanguages: function ( languages ) {

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

        removedLanguage = this.state.languages.filter( function ( l ) {

          return languages.indexOf( l ) == -1;

        } )[ 0 ];

        return this.onChangedLanguage( languages, removedLanguage );

      }


      // a language was added
      addedLanguage = languages.filter( function ( l ) {

        return self.state.languages.indexOf( l ) == -1;

      } )[ 0 ];

      this.onChangedLanguage( languages, addedLanguage, '' );

    },

    renderMarkdownField: function () {

      return <div className="multilingual-input-field">
        <Wysiwyg
          markdown={true}
          label={this.props.configuration.field( 'longDescription' ).getLabel( false, this.props.labels )}
          placeholder={this.props.configuration.field( 'longDescription' ).getPlaceholder( false, this.props.labels )}
          info={this.props.configuration.field( 'longDescription' ).getInfo( false, null )}
          name='long_description'
          value={this.state.freeText}
          languages={this.state.languages}
          onChange={this.onChange( 'freeText' )}
          lang={this.props.lang} />
      </div>

    },

    renderLocationSelector: function () {

      const settings = _.extend( {
        translation: this.state.translation || null
      }, this.props.configuration.field( 'location' ).settings || {} );

      return <div className="form-section">
        { this.props.configuration.field( 'location' ).info && ( this.state.locationMode !== 'create' ) ?
        <p>{ this.props.configuration.field( 'location' ).info[ this.props.lang ] }</p> : null }
        <LocationSelector
          allowCreate={this.props.contributionConfiguration.allowLocationCreate}
          settings={settings}
          mode={this.state.locationMode}
          disableChange={this.props.configuration.field( 'location' ).disableChange}
          onChangeMode={this.onLocationModeChange}
          location={this.state.location}
          lang={this.props.lang}
          res={this.props.locationRes}
          onChange={this.onLocationChange} />
      </div>

    },

    displayLanguageBar: function() {

      return !!this.props.configuration.field( 'language' ).get( 'display', true );

    },

    render: function () {

      let displayedLanguageBar = false, displayedTranslator = false;

      const renderLanguageBar = () => {

        if ( !this.displayLanguageBar() ) return null;

        if ( displayedLanguageBar ) return null;

        displayedLanguageBar = true;

        return <LanguageBar
          languages={this.state.languages}
          onChange={this.changeLanguages}
          getLabel={this.getLabel} />

      }

      const renderTranslator = () => {

        displayedTranslator = true;

        return <div className="margin-v-lg">
          <Translation
            source={this.state.translation.source}
            sets={this.state.translation.sets}
            check={translator.change.bind( null, true )}
            uncheck={translator.change.bind( null, false )}
            sourceChange={translator.sourceChange.bind( null )}
            labels={flattenLabels( _.extend( translationLabels, this.props.configuration.field( 'translation' ).getAll() ), this.props.lang )}
          />
        </div>

      }

      return <div>

      { this.props.order.map( o => {

        if ( o.field === 'image'  ) {

          return <div>{this.props.configuration.field( 'image' ).display() ? <div
            className="js_event_image_canvas"
            attr-credits-display={this.props.configuration.field( 'credits' ).display() ? '1' : '0' }
            attr-credits-label={JSON.stringify( this.props.configuration.field( 'credits' ).getLabel( true ) )}
            attr-credits-info={JSON.stringify( this.props.configuration.field( 'credits' ).getInfo( true ) )}
            attr-credits-placeholder={JSON.stringify( this.props.configuration.field( 'credits' ).getPlaceholder( true ) )}
          ></div> : null}</div>;

        }

        if ( o.field === 'title' ) {

          return <div>
            {renderLanguageBar()}
            <div className="multilingual-input-field">
              <MultilingualTextField
                constraints={{ max: 140 }}
                counter={true}
                optional={false}
                label={this.props.configuration.field( 'title' ).getLabel( false, this.props.labels )}
                placeholder={this.props.configuration.field( 'title' ).getPlaceholder( false, this.props.labels )}
                info={this.props.configuration.field( 'title' ).getInfo( false, null )}
                name='title'
                type='text'
                value={this.state.title}
                error={formErrors.title}
                languages={this.state.languages}
                onChange={this.onChange( 'title' )}
                lang={this.props.lang} />
            </div>
          </div>;

        }

        if ( o.field === 'description' ) {

          return <div>
            {renderLanguageBar()}
            {!this.props.configuration.field( 'description' ).fixed() ?
            <div className="multilingual-input-field">
              <MultilingualTextField
                constraints={{ max: 200 }}
                counter={true}
                optional={false}
                label={this.props.configuration.field( 'description' ).getLabel( false, this.props.labels )}
                placeholder={this.props.configuration.field( 'description' ).getPlaceholder( false, this.props.labels )}
                info={this.props.configuration.field( 'description' ).getInfo( false, null )}
                name='description'
                type='text'
                value={this.state.description}
                error={formErrors.description}
                languages={this.state.languages}
                onChange={this.onChange( 'description' )}
                lang={this.props.lang} />
            </div>
            : null}
          </div>;

        }

        if ( o.field === 'longDescription' ) {

          return <div>
            {renderLanguageBar()}
            {this.renderMarkdownField()}
          </div>;

        }

        if ( o.field === 'keywords' ) {

          return <div>
            {renderLanguageBar()}
            {this.props.configuration.field( 'keywords' ).display() ?
            <div className="multilingual-input-field">
              <EventKeywordsField
                constraints={{ max: 255 }}
                counter={true}
                value={this.state.keywords}
                name='keywords'
                optional={true}
                languages={this.state.languages}
                onChange={this.onChange( 'keywords' )}
                label={this.props.configuration.field( 'keywords' ).getLabel( false, this.props.labels )}
                error={formErrors.keywords}
                placeholder={this.props.configuration.field( 'keywords' ).getPlaceholder( false, this.props.labels )}
                info={this.props.configuration.field( 'keywords' ).getInfo( false, null )}
                lang={this.props.lang} />
            </div> : null}
          </div>;

        }

        if ( o.field === 'translation' ) {

          return renderTranslator();

        } 

        if ( o.field === 'conditions' ) {

          return <div>
            {renderLanguageBar()}
            {this.props.configuration.field( 'conditions' ).display() ? <div className="multilingual-input-field">
            <MultilingualTextField
              constraints={{ max: 255 }}
              counter={true}
              label={this.props.configuration.field( 'conditions' ).getLabel( false, this.props.labels )}
              placeholder={this.props.configuration.field( 'conditions' ).getPlaceholder( false, this.props.labels )}
              info={this.props.configuration.field( 'conditions' ).getInfo( false, null )}
              name='conditions'
              type='text'
              optional={this.props.configuration.field( 'conditions' ).get( 'optional', true ) }
              value={this.state.conditions}
              error={formErrors.conditions}
              languages={this.state.languages}
              onChange={this.onChange( 'conditions' )}
              lang={this.props.lang} />
            </div> : null}
          </div>;

        }

        if ( o.field === 'registration' ) {

          return <div>{this.props.configuration.field( 'registration' ).display() ? <div className="margin-bottom-md"><Registration
            info={this.props.configuration.field( 'registration' ).getInfo( false, false )}
            lang={this.props.lang}
            label={this.props.configuration.field( 'registration' ).getLabel( false, this.props.labels )}
            placeholder={this.props.configuration.field( 'registration' ).getPlaceholder( false, this.props.labels )}
            value={this.state.ticketLink}
            onChange={this.onChangeRegistration} /></div> : null}</div>

        }

        if ( o.field === 'accessibility' ) {

          return <div>{this.props.configuration.field( 'accessibility' ).display() ? <AccessibilityFields
            value={this.state.accessibility || []}
            label={this.props.labels.accessibility}
            info={this.props.configuration.field( 'accessibility' ).getInfo( false, false )}
            onChange={this.onChange( 'accessibility' )}
            labelsLang={this.props.lang} /> : null}</div>

        }

        if ( o.field === 'age' ) {

          return <div>{this.props.configuration.field( 'age' ).display() ? <AgeFields
            value={this.state.age}
            label={this.props.labels.age}
            info={this.props.configuration.field( 'age' ).getInfo( true, false )}
            onChange={this.onChange( 'age' )}
            labelsLang={this.props.lang} /> : null}</div>;

        }

        if ( o.field === 'references' ) {

          const sample = _.extend( _.pick( this.state, [ 'title', 'description', 'keywords', 'location', 'custom' ] ), {
            tags: _.get( this.state, 'agendas.0.tags', [] ),
            category: _.get( this.state, 'agendas.0.category' )
          } );

          return <div>{this.props.configuration.field( 'references' ).display( false ) ? <References
            uid={this.state.uid}
            initUids={this.state.references}
            res={this.props.referenceRes}
            info={this.props.configuration.field( 'references' ).getInfo( true, false )}
            sample={sample}
            onChange={this.props.onReferencesChange}
          /> : null}</div>

        }

        if ( o.field === 'location' ) {

          return <div className="margin-v-lg">
            <label>{this.props.labels.locationSection[ this.props.lang ]} (*)</label>
            {this.state.locationMode === 'create' ?
              <Modal disableBodyScroll={true} classNames={{
                overlay: 'popup-overlay big'
              }} onClose={() => {
                this.onLocationModeChange( 'search' );
              }}>
                {this.renderLocationSelector()}
              </Modal>
              : this.renderLocationSelector()}
          </div>

        }

        if ( o.field === 'timings' ) {

          return <div className="margin-v-lg">
            <TimingsPicker
              labels={this.props.labels}
              info={this.props.configuration.field( 'timings' ).getInfo( true, false )}
              lang={this.props.lang}
              error={formErrors.timings}
              timings={this.state.timings}
              configuration={this.props.configuration.field( 'timings' )}
              onChange={this.onTimingsChange} />
          </div>

        }

        if ( o.origin === 'tags' ) {

          return <div>{( this.props.tags && this.props.tags.length ) || ( this.props.tagSet && this.props.tagSet.groups.length ) ?
            <TagSelector
              filter={o.field}
              lang={this.props.lang}
              set={this.props.tagSet}
              tags={this.props.tags}
              selection={this.getSelectedTags()}
              onChange={this.onTagsCategoryChange( 'tags' )}
              labels={this.props.labels} /> : ''}</div>

        }

        if ( o.origin === 'categories' ) {

          return <div>{( this.props.categories && this.props.categories.length ) || ( this.props.categorySet && this.props.categorySet.categories.length ) ?
            <CategorySelector
              lang={this.props.lang}
              set={this.props.categorySet}
              categories={this.props.categories}
              selection={this.getSelectedCategory()}
              onChange={this.onTagsCategoryChange( 'category' )}
              labels={this.props.labels} />
          : ''}</div>

        }

        const index = ( this.props.custom || [] ).map( c => c.name ).indexOf( o.field );

        if ( index !== -1 ) {

          const field = this.props.custom[ index ];

          return <CustomField
            key={field.name}
            labels={this.props.labels}
            res={this.props.customRes}
            field={field}
            value={this.state.custom[ field.name ]}
            error={formErrors[ field.name ]}
            languages={this.state.languages}
            lang={this.props.lang}
            onChange={ ( field.fieldType==='image' ? this.onCustomImageChange : this.onCustomChange ).bind( null, field.name ) }
          />

        }


        return console.log( 'not rendering', o.field );

      } ) }

      { this.state.translation && !displayedTranslator ? renderTranslator() : null }

        <div className="js_form_canvas_below"></div>

        <p className="margin-top-sm">{this.getLabel( 'compulsoryNote' )}</p>

        {this.state.translation && this.state.translation.translating && !this.state.translation.deactivated ?
          <Spinner page={true} message={ translationLabels.processingTranslation[ this.props.lang ] + this.formatTranslationMessage() } />
          : null}

        {_.get( this.state, 'translation.deactivated', false ) ?
          <Spinner page={true} message={translationLabels.deactivatedTranslation[ this.props.lang ]} />
        : null }

        {this.state.submitSpin ?
          <Spinner page={true}
            message={this.state.translation && this.state.translation.timeouts ? translationLabels.savingPartialTranslation[ this.props.lang ] : null} />
          : null}

      </div>

    }

  } );

}
