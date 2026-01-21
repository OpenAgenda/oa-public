import _ from 'lodash';
import Dropzone from 'react-dropzone';
import { Component } from 'react';

import multilingualLabels from '@openagenda/labels/form-schemas/fileUpload.js';
import flattenLabels from '@openagenda/labels/flatten.js';
import extensionsToAccept from '../lib/extensionsToAccept.js';

export default class FileField extends Component {
  constructor(props) {
    super(props);
    this.onRemove = this.onRemove.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.hasValue = this.hasValue.bind(this);
  }

  onRemove() {
    const { onChange } = this.props;
    onChange(null);
  }

  onDrop(acceptedFiles, _rejectedFiles) {
    const { onChange } = this.props;
    onChange(
      {
        originalName: _.get(acceptedFiles, '0.name'),
      },
      acceptedFiles,
    );
  }

  hasValue() {
    return !!_.get(this.props, 'value.originalName');
  }

  render() {
    const { field, lang, value } = this.props;

    const labels = flattenLabels(multilingualLabels, lang);

    const {
      field: name,
      // placeholder,
      extensions,
      // store,
    } = field;

    return (
      <div className="file-upload">
        <Dropzone
          disabled={field.enable === false}
          accept={extensionsToAccept(extensions)}
          multiple={false}
          name={name}
          onDrop={this.onDrop}
        >
          {({ getRootProps, getInputProps }) => (
            <div className="file-dropzone" {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="margin-top-lg margin-bottom-sm">
                <button type="button" className="btn btn-primary margin-top-sm">
                  <label>{labels.upload}</label>
                </button>
                {this.hasValue() && (
                  <div className="margin-v-xs">
                    <label className="control-label">
                      <i className="fa fa-check margin-right-xs" />
                      <span>{_.get(this.props, 'value.originalName')}</span>
                    </label>
                  </div>
                )}
              </div>
              <span className="accepted-info">
                {labels.acceptedExtensions}:&nbsp; .
                {[].concat(extensions).join(', .')}
              </span>
            </div>
          )}
        </Dropzone>
        {value ? (
          <button
            type="button"
            onClick={this.onRemove}
            className="btn btn-danger margin-left-xs remove-file"
            title={labels.remove}
            aria-label={labels.remove}
          >
            <i className="fa fa-trash" />
          </button>
        ) : null}
      </div>
    );
  }
}
