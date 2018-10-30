"use strict";

import _ from 'lodash';
import Dropzone from 'react-dropzone';
import React, { Component } from 'react';

import multilingualLabels from '@openagenda/labels/form-schemas/fileUpload';
import flattenLabels from '@openagenda/labels/flatten';

module.exports = class FileField extends Component {

  onRemove() {

    this.props.onChange( null );

  }

  onDrop( acceptedFiles, rejectedFiles ) {

    // revoke preview to avoid memory leaks
    // https://github.com/react-dropzone/react-dropzone#proptypes
    acceptedFiles.forEach( file => {

      try {
        
        window.URL.revokeObjectURL( file.preview );

      } catch ( e ) {

        console.error( 'could not revoke preview', e );

      }

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
        className="file-dropzone"
        multiple={false}
        name={ name }
        onDrop={this.onDrop.bind( this )}
      >
        <div className="margin-top-lg margin-bottom-sm">
          <button className="btn btn-primary margin-top-sm">
            <label>{labels.upload}</label>
          </button>
          {this.props.value && <div className="margin-v-xs">
            <label className="control-label">
              <i className="fa fa-check margin-right-xs"></i>
              <span>{_.get( this.props, 'value.originalName' )}</span>
            </label>
          </div>}
        </div>
        <span className="accepted-info">{labels.acceptedExtensions}:&nbsp; .{[].concat( extensions ).join( ', .' )}</span>
      </Dropzone>
      { this.props.value ? <a
        onClick={this.onRemove.bind( this )} 
        className="btn btn-danger margin-left-xs remove-file"
        title={labels.remove} >
        <i className="fa fa-trash"></i>
      </a> : null }
    </div>

  }

}
