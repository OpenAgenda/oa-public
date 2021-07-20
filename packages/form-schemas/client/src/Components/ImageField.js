import _ from 'lodash';
import Dropzone from 'react-dropzone';
import React, { Component } from 'react';

import multilingualLabels from '@openagenda/labels/form-schemas/imageUpload';
import flattenLabels from '@openagenda/labels/flatten';

import storePaths from '../lib/storePaths';

export default class ImageField extends Component {

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

    const files = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    this.setState( {
      preview: _.get( files, '0.preview' )
    } );

    this.props.onChange( {
      originalName: _.get( files, '0.name' )
    }, files );

  }

  render() {

    const labels = flattenLabels( multilingualLabels, this.props.lang, true );

    const {
      field: name,
      placeholder,
      extensions,
      store
    } = this.props.field;

    return <div className="file-upload">
      <Dropzone
        accept={"." + extensions.join(",.")}
        multiple={false}
        name={name}
        onDrop={this.onDrop.bind(this)}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            className={this.state.preview ? "file-dropzone image-preview" : "file-dropzone"}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {this.state.preview && (
              <div className="center-button margin-bottom-sm">
                <button className="btn btn-primary margin-all-sm">
                  <label>{labels.update}</label>
                </button>
              </div>
            )}
            {this.state.preview && (
              <img className="padding-all-sm" src={this.state.preview} />
            )}
            {!this.state.preview && (
              <div className="center-button margin-bottom-sm">
                <button className="btn btn-primary">
                  <label>{labels.upload}</label>
                </button>
              </div>
            )}
            <span className="accepted-image-info">
              {labels.acceptedExtensions}:&nbsp; .{[].concat(extensions).join(", .")}
            </span>
          </div>
        )}
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
