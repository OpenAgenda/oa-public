"use strict";

import utils from 'utils'
import du from 'dom-utils'
import React from 'react'
import ReactDom from 'react-dom'
import Spinner from 'react-form-components/build/Spinner'
import TagSelector from 'agenda-tags/lib/TagSelector.jsx'
import CategorySelector from 'agenda-categories/lib/CategorySelector.jsx'
import genLabelGet from 'labels'
import labels from 'labels/event/tagsForm'
import categorySetLabels from 'labels/agenda-categories/selector'
import tagSetLabels from 'labels/agenda-tags/selector'
import Modal from 'react-components/build/Modal'
import get from 'utils/get'
import post from 'utils/post'
import update from 'react-addons-update'

const defaults = {
  canvas: '.js_canvas',
  lang: 'en'
},

getLabel = genLabelGet( labels ),

App = React.createClass( {

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

    console.log( this.props );

    get( this.props.res, ( err, data ) => {

      if ( err ) return this.setState( {
        loading: false,
        loadingError: true
      } );

      return this.setState( {
        tagSet: data.tagSet,
        categorySet: data.categorySet,
        event: data.event,
        loading: false
      } );

    } );

  },

  getTitle() {

    let firstLang = Object.keys( this.state.event.title )[ 0 ];

    return this.state.event.title[ this.props.lang ] || this.state.event.title[ firstLang ];

  },

  onChange( type ) {

    return values => {

      let changes = { event: {} };

      changes.event[ type ] = { $set: values };

      this.setState( update( this.state, changes ) );

    }

  },

  onSuccess() {

    this.setState( {
      saving: false,
      saveSuccess: true
    } )

    setTimeout( () => {

      window.location.href = this.props.redirect;

    }, 1000 );

  },

  submit() {

    this.setState( {
      saving: true
    } );
    
    post( this.props.res, { event: this.state.event }, ( err, result ) => {

      if ( err || !result.success ) return this.setState( {
        saving: false,
        saveError: true
      } );

      this.onSuccess();

    }, 1000 );

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
      { !this.state.saving ? 
        <button onClick={this.submit} className="btn btn-primary">{getLabel( 'submit', this.props.lang )}</button>
        : <button className="btn btn-primary" style={{position: 'relative'}}>{getLabel( 'submit', this.props.lang )} <Spinner spinner={{color: '#666', width: 1, length: 3, radius: 6}} /></button>
      }
      { this.state.saveSuccess ? <span className="info info-success info-padded">{ getLabel( 'saveSuccess', this.props.lang )}</span> : null }
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

  ReactDom.render( <App {...params} />, du.el( params.canvas ) );

} );