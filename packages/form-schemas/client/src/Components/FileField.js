"use strict";

import _ from 'lodash';
import React, { Component } from 'react';

import Dropzone from 'react-dropzone';

module.exports = class FileField extends Component {

  onDrop( acceptedFiles, rejectedFiles ) {

    this.props.onChange( _.first( acceptedFiles ) );

  }

  render() {
    
    const {
      field: name, 
      placeholder,
      extensions
    } = this.props.field;

    return <div className="file-upload">
      <Dropzone
        accept={ '.' + extensions.join( ',.' ) }
        className="file-dropzone"
        multiple={false}
        name={ name }
        onDrop={this.onDrop.bind( this )}
      >
        <button className="btn btn-primary">
          <label>Allo, allo quoi</label>
        </button>
      </Dropzone>
    </div>

  }

}
