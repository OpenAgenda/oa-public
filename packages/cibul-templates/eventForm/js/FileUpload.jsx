"use strict";

import Dropzone from 'react-dropzone';
import createReactClass from 'create-react-class';
import React from 'react';
import sa from 'superagent';
import labels from '@openagenda/labels/form-schemas/fileUpload';
import Spinner from '@openagenda/react-components/build/Spinner';

module.exports = createReactClass({

  getInitialState: function() {

    return {
      loading: false,
      error: false
    };

  },

  getDefaultProps: function() {

    return {
      name: null, // name of the field
      upload: null, // path for uploading
      remove: null, // path for removing
      lang: 'fr',
      extension: 'noextension',
      label: {
        fr: 'Charger un %s',
        en: 'Upload a %s'
      },
      info: null,
      optional: true,
      path: null,
      value: null
    }

  },

  onRemove: function( e ) {

    e.preventDefault();

    if ( !this.props.value ) return;

    this.setState( {
      loading: true
    } );

    const req = sa.post( this.props.remove );

    req.end( ( err, res ) => {

      const error = err ? labels.error[ this.props.lang ] : false;

      this.setState( {
        loading: false,
        error
      } );

      if ( !error ) {

        this.props.onChange( null, [] );

      }

    } );

  },

  onUploadStart: function( acceptedFiles, rejectedFiles ) {

    if ( !acceptedFiles.length ) return;

    const req = sa.post( this.props.upload );

    const file = acceptedFiles[ 0 ];

    req.attach( 'file', file );

    this.setState( {
      loading: true
    } );
    
    req.end( ( err, res ) => {

      const error = err ? labels.error[ this.props.lang ] : false;

      this.setState( {
        loading: false,
        error
      } )

      this.props.onChange( error ? null : {
        name: res.body.name,
        uploaded: res.body.path.split( '/' ).pop()
      }, error );

      /**
       * arguments[ 1 ] : {
       *   body: {
       *     name: 'plaquette - recto.pdf',
       *     path: 'https://cibuldev.s3.amazonaws.com/bde341bc2be643079b97bc85e08a6d7d.event.somepdf.pdf'
       *   }
       * }
       */

    } );

  },

  render: function() {

    return <div className={ this.state.error ? 'form-group has-error' : 'form-group'}>
      <label>{this.props.label[ this.props.lang ].replace( '%s', [].concat( this.props.extension ).join( ', ' ) )}{ this.props.optional ? '' : ' (*)' }</label>
      { this.props.info ? <span className="info">{this.props.info[ this.props.lang ]}</span> : null }
      <div className="file-upload">
        <Dropzone
          disabled={ this.state.loading }
          accept={ '.' + [].concat( this.props.extension ).join( ',.' ) }
          className="file-dropzone"
          multiple={false}
          name={ this.props.name }
          onDrop={ this.onUploadStart } >
          <button className={ this.state.loading ? 'btn btn-primary loading-file' : 'btn btn-primary' }>
            <label>{ !this.props.value || this.state.error ? labels.upload[ this.props.lang ] : labels.replace[ this.props.lang ] }</label>
            { this.state.loading ? <Spinner mode="inline" options={{
              color: '#fff',
              width: 2,
              length: 2,
              radius: 5
            }} /> : null }
          </button>
          <div className="margin-v-xs">
            <label className="control-label">{this.getBottomLabel()}</label>
          </div>
        </Dropzone>
        <span>Fichiers acceptés: { '.' + [].concat( this.props.extension ).join( ', .' ) }</span>
        { this.props.value ? <a 
          href="#"
          onClick={this.onRemove}
          className="btn btn-danger margin-left-xs remove-file" 
          title={labels.remove[ this.props.lang ]}>
          <i className="fa fa-trash"></i>
        </a> : null }
      </div>
    </div>

  },

  getBottomLabel: function() {

    if ( this.state.loading ) {

      return <label className="control-label">{ labels.loading[ this.props.lang ] }</label>

    } else if ( this.state.error ) {

      return <label className="control-label">{ this.state.error }</label>;

    } else if ( this.props.value ) {

      return <label className="control-label">
        <i className="fa fa-check margin-right-xs"></i>
        <span>{this.props.value.name}</span>
      </label>

    }

    return <div>
      <label className="control-label margin-v-xs">{labels.or[ this.props.lang ]}</label>
      <label className="control-label margin-top-xs">{labels.tip[ this.props.lang ]}</label>
    </div>

  }

});
