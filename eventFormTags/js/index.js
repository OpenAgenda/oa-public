"use strict";

import utils from 'utils'
import du from 'dom-utils'
import React from 'react'
import ReactDom from 'react-dom'
import createReactClass from 'create-react-class'
import Spinner from '@openagenda/react-form-components/build/Spinner'
import TagSelector from 'agenda-tags/lib/TagSelector.jsx'
import CategorySelector from 'agenda-categories/lib/CategorySelector.jsx'
import CustomFields from '../../eventForm/js/CustomFields.jsx'
import genLabelGet from 'labels'
import labels from 'labels/event/tagsForm'
import categorySetLabels from 'labels/agenda-categories/selector'
import tagSetLabels from 'labels/agenda-tags/selector'
import Modal from 'react-components/build/Modal'
import get from 'utils/get'
import post from 'utils/post'
import update from 'immutability-helper'
import omitBy from 'lodash/omitBy'

const defaults = {
  canvas: '.js_canvas',
  lang: 'en'
},

getLabel = genLabelGet( labels ),

App = createReactClass( {

  getInitialState() { return {
    loading: true,
    saving: false,
    loadingError: false,
    saveError: false,
    saveSuccess: false
  } },

  getDefaultProps() {

    return {
      res: ''
    }

  },

  componentWillMount() {

    get( this.props.res, ( err, data ) => {

      if ( err ) return this.setState( {
        loading: false,
        loadingError: true
      } );

      return this.setState( {
        tagSet: data.tagSet,
        categorySet: data.categorySet,
        customSet: data.customSet,
        event: data.event,
        languages: data.languages,
        customSetErrors: {},
        loading: false
      } );

    } );

  },

  getTitle() {

    let firstLang = Object.keys( this.state.event.title )[ 0 ];

    return this.state.event.title[ this.props.lang ] || this.state.event.title[ firstLang ];

  },

  onChange( type ) {

    let self = this;

    return function( values ) {

      let changes = { event: {} };

      if ( type === 'custom' ) {

        let field = arguments[ 0 ], 

          value = arguments[ 1 ],

          error = arguments[ 2 ];

        changes.event[ type ] = {};

        changes.event[ type ][ field ] = {
          $set: value
        }

        changes.customSetErrors = {}

        // if error is undefined, the key should be unset rather than set to 'undefined'
        changes.customSetErrors[ field ] = {
          $set: error
        };

      } else {
        
        changes.event[ type ] = { 
          $set: values
        };

      }

      self.setState( update( self.state, changes ) );

    }

  },

  onSuccess() {

    this.setState( {
      saving: false,
      saveSuccess: true
    } );

    setTimeout( this.redirect, 500 );

  },

  redirect() {

    window.location.href = this.props.redirect;

  },

  onCancel( e ) {

    e.preventDefault();

    window.location.href = this.props.redirect;

  },

  submit() {

    if ( this.hasValidationErrors() ) return;

    this.setState( {
      saving: true
    } );
    
    post( this.props.res, { event: this.state.event }, ( err, result ) => {

      if ( err || !result.success ) {

        return this.setState( {
          saving: false,
          saveError: true
        } );

      }

      this.onSuccess();

    } );

  },

  hasValidationErrors() {

    return !!Object.keys( omitBy( this.state.customSetErrors, v => !v ) ).length;

  },

  renderLoaded() {

    if ( this.state.loadingError ) {

      return <div className="alert alert-danger" role="alert">{getLabel( 'loadingError', this.props.lang )}</div>

    }

    return <div className="form-page">
      <div className="form-head">
        <h2>{this.getTitle()}</h2>
        <p>{getLabel( 'description', this.props.lang )}</p>
      </div>
      { this.state.categorySet.categories.length ? <CategorySelector 
        lang={this.props.lang}
        set={this.state.categorySet}
        selection={this.state.event.category}
        onChange={ this.onChange( 'category' ) }
        labels={categorySetLabels}
      /> : null }
      { this.state.tagSet.groups.length ? <TagSelector
        lang={this.props.lang}
        set={this.state.tagSet}
        selection={this.state.event.tags}
        onChange={ this.onChange( 'tags' ) }
        labels={tagSetLabels}
      /> : null }
      { this.state.customSet.length ? <CustomFields
        lang={this.props.lang}
        fields={this.state.customSet.filter( c => c.fieldType !== 'image' )}
        values={this.state.event.custom}
        onChange={ this.onChange( 'custom' ) }
        labels={labels}
        res={{upload:'', remove: ''}}
        languages={this.state.languages}
        errors={this.state.customSetErrors}
      /> : null }
      { this.hasValidationErrors() ? <p className="error bg-danger margin-v-md padding-v-sm padding-h-sm">{getLabel( 'invalidError', this.props.lang )}</p> : null }
      <a href="#" className="text-danger" onClick={this.onCancel}>{getLabel( 'cancel', this.props.lang )}</a>
      { this.state.saving ? <button className="btn btn-primary pull-right" style={{position: 'relative'}}>{getLabel( 'submit', this.props.lang )} <Spinner spinner={{color: '#666', width: 1, length: 3, radius: 6}} /></button> : null }
      { !this.state.saving && !this.state.saveSuccess ? <button onClick={this.submit} className="btn btn-primary pull-right">{getLabel( 'submit', this.props.lang )}</button> : null }
      { this.state.saveSuccess ? <button className="btn btn-success pull-right">{getLabel( 'submitted', this.props.lang )} <i className="fa fa-check"></i></button> : null }
      { this.state.saveError ? <Modal 
        title={getLabel( 'saveErrorTitle', this.props.lang )}
        onClose={() => { this.setState( { saveError: false } ) } }>
        <p>{ getLabel( 'saveError', this.props.lang ) }</p>
      </Modal> : null }
    </div>

  },

  render() {

    return <div className="container">
      <div className="row">
        <div className="col-sm-6 col-sm-offset-3 top-margined wsq">
          <div className="content">
            { this.state.loading ? <Spinner /> : this.renderLoaded() }
          </div>
        </div>
      </div>
    </div>

  }

} );

window.hook( options => {

  let params = utils.extend( {}, defaults, options );

  ReactDom.hydrate( <App {...params} />, du.el( params.canvas ) );

} );