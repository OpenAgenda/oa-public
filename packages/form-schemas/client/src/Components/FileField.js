import _ from 'lodash';
import Dropzone from 'react-dropzone';
import React, { Component } from 'react';

import multilingualLabels from '@openagenda/labels/form-schemas/fileUpload';
import flattenLabels from '@openagenda/labels/flatten';

export default class FileField extends Component {

  onRemove() {

    this.props.onChange( null );

  }

  onDrop( acceptedFiles, rejectedFiles ) {

    this.props.onChange( {
      originalName: _.get( acceptedFiles, '0.name' )
    }, acceptedFiles );

  }

  hasValue() {

    return !!_.get( this.props, 'value.originalName' );

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
        disabled={field.enable === false}
        accept={ '.' + extensions.join( ',.' ) }
        multiple={false}
        name={ name }
        onDrop={this.onDrop.bind( this )}
      >
        {({getRootProps, getInputProps}) => (
          <div className="file-dropzone" {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="margin-top-lg margin-bottom-sm">
              <button className="btn btn-primary margin-top-sm">
                <label>{labels.upload}</label>
              </button>
              {this.hasValue() && <div className="margin-v-xs">
                <label className="control-label">
                  <i className="fa fa-check margin-right-xs"></i>
                  <span>{_.get( this.props, 'value.originalName' )}</span>
                </label>
              </div>}
            </div>
            <span className="accepted-info">{labels.acceptedExtensions}:&nbsp; .{[].concat( extensions ).join( ', .' )}</span>
          </div>
        )}
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
