"use strict";

import _ from 'lodash';
import Dropzone from 'react-dropzone';
import React, { Component } from 'react';

import multilingualLabels from '@openagenda/labels/form-schemas/imageUpload';
import flattenLabels from '@openagenda/labels/flatten';

import storePaths from '../lib/storePaths';

module.exports = class ImageField extends Component {

  constructor( props ) {

    super( props );

    const { store } = this.props.field;

    const filename = _.get( this.props, 'value.filename' );

    this.state = {
      preview: filename ? [ storePaths( store ), filename ].join( '/' ) : null
    };

  }

  onRemove() {

    this.setState( {
      preview: null
    } );

    this.props.onChange( null );

  }

  onDrop( acceptedFiles, rejectedFiles ) {

    this.setState( {
      preview: _.get( acceptedFiles, '0.preview' )
    } );

    this.props.onChange( {
      originalName: _.get( acceptedFiles, '0.name' )
    }, acceptedFiles );

  }

  render() {

    const labels = flattenLabels( multilingualLabels, this.props.lang );
    
    const {
      field: name, 
      placeholder,
      extensions,
      store
    } = this.props.field;

    return <div className="file-upload">
      <Dropzone
        accept={ '.' + extensions.join( ',.' ) }
        className={ this.state.preview ? 'file-dropzone image-preview' : 'file-dropzone' }
        multiple={false}
        name={name}
        onDrop={this.onDrop.bind( this )}
      >
        { this.state.preview &&
          <div className="center-button margin-bottom-sm">
            <button className="btn btn-primary margin-all-sm">
              <label>{labels.update}</label>
            </button>
          </div> }
        { this.state.preview &&
          <img className="padding-all-sm" src={this.state.preview} />
        }
        { !this.state.preview &&
          <div className="center-button margin-bottom-sm">
            <button className="btn btn-primary">
              <label>{labels.upload}</label>
            </button> 
          </div>
        }
        <span className="accepted-image-info">{labels.acceptedExtensions}:&nbsp; .{[].concat( extensions ).join( ', .' )}</span>
      </Dropzone>
      { this.props.value ? <a
        onClick={this.onRemove.bind( this )} 
        className="btn btn-danger margin-all-sm remove-file"
        title={labels.remove} >
        <i className="fa fa-trash"></i>
      </a> : null }
    </div>

  }

}
