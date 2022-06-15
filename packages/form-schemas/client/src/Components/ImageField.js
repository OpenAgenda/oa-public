import _ from 'lodash';
import Dropzone from 'react-dropzone';
import React, { Component } from 'react';

import multilingualLabels from '@openagenda/labels/form-schemas/imageUpload';
import flattenLabels from '@openagenda/labels/flatten';

import storePaths from '../lib/storePaths';

export default class ImageField extends Component {
  constructor(props) {
    super(props);

    const {
      field: {
        store
      }
    } = this.props;

    const filename = _.get(this.props, 'value.filename');

    this.state = {
      preview: filename ? [storePaths(store), filename].join('/') : null
    };

    this.onDrop = this.onDrop.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onRemove() {
    const {
      onChange
    } = this.props;

    this.setState({
      preview: null
    });

    onChange(null);
  }

  onDrop(acceptedFiles) {
    const {
      onChange
    } = this.props;

    const files = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    this.setState({
      preview: _.get(files, '0.preview')
    });

    onChange({
      originalName: _.get(files, '0.name')
    }, files);
  }

  render() {
    const {
      lang,
      field,
      value
    } = this.props;

    const labels = flattenLabels(multilingualLabels, lang, true);

    const {
      field: name,
      extensions,
    } = field;

    const {
      preview
    } = this.state;

    return (
      <div className="file-upload">
        <Dropzone
          disabled={field.enable === false}
          accept={`.${extensions.join(',.')}`}
          multiple={false}
          name={name}
          onDrop={this.onDrop}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              className={preview ? 'file-dropzone image-preview' : 'file-dropzone'}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {preview && (
                <div className="center-button margin-bottom-sm">
                  <button type="button" className="btn btn-primary margin-all-sm">
                    {labels.update}
                  </button>
                </div>
              )}
              {preview && (
                <img alt="" className="padding-all-sm" src={preview} />
              )}
              {!preview && (
                <div className="center-button margin-bottom-sm">
                  <button type="button" className="btn btn-primary">
                    {labels.upload}
                  </button>
                </div>
              )}
              <span className="accepted-image-info">
                {labels.acceptedExtensions}:&nbsp; .{[].concat(extensions).join(', .')}
              </span>
            </div>
          )}
        </Dropzone>
        {value ? (
          <button
            type="button"
            onClick={this.onRemove}
            className="btn btn-danger margin-all-sm remove-file"
            title={labels.remove}
          >
            <i className="fa fa-trash" />
          </button>
        ) : null}
      </div>
    );
  }
}
