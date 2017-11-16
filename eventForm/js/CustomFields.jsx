"use strict";

import React from 'react';
import createReactClass from 'create-react-class';
import Wysiwyg from './Wysiwyg.jsx';
import MultilingualTextField from './MultilingualTextField.jsx';
import TextField from './TextField.jsx';
import CheckboxField from './CheckboxField.jsx';
import RadioFields from './RadioFields.jsx';
import SelectField from './SelectField.jsx';
import ImageUpload from '@openagenda/image-upload/components/build/ImageUploader';
import HTMLComponent from '@openagenda/react-form-components/build/HTMLComponent';
import FileUpload from './FileUpload.jsx';

module.exports = createReactClass({

  onImageChange: function( field ) {

    var self = this;

    return function( value, error ) {

      if ( value ) {

        value = value.split( '/' ).pop(); // we just want the file name, not the full url

      }

      self.props.onChange( field, value, error );

    }

  },

  render: function() {

    var self = this,

    createField = function( field ) {

      if ( [ 'integer', 'text', 'textarea', 'number', 'url', 'email' ].indexOf( field.fieldType ) !== -1 ) {

        if ( field.multilingual ) {

          return <div className="multilingual-input-field form-group margin-v-md">
            <MultilingualTextField
              name={ field.name }
              constraints= { field } 
              label= { field.label }
              info= { field.info }
              optional= { field.optional }
              lang= { self.props.lang } 
              type= { field.fieldType } 
              value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : {} }
              error= { self.props.errors[ field.name ] || false }
              languages= { self.props.languages }
              onChange= { self.props.onChange.bind( null, field.name ) } />
            </div>;

        } else {

          return <div className="margin-v-md">
            <TextField 
              name= { field.name }
              constraints= { field }
              label= { field.label }
              info= { field.info } 
              optional= { field.optional }
              lang= { self.props.lang } 
              type= { field.fieldType }
              enriched= { !!field.enriched }
              value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
              error= { self.props.errors[ field.name ] || false }
              onChange= { self.props.onChange.bind( null, field.name ) } />
          </div>

        }

      } else if ( field.fieldType === 'wysiwyg' && field.multilingual ) {

        return <div className="margin-v-md  multilingual-input-field">
          <Wysiwyg
            name={field.name}
            lang={self.props.lang}
            label={field.label}
            placeholder={field.info}
            languages={self.props.languages}
            value={self.props.values[ field.name ]}
            onChange={ self.props.onChange.bind( null, field.name ) }
          />
        </div>

      } else if ( field.fieldType === 'wysiwyg' ) {

        return <div className="margin-v-md">
          <HTMLComponent
            lang={self.props.lang}
            label={field.label[ self.props.lang]}
            placeholder={field.info[ self.props.lang ]}
            onChange={ self.props.onChange.bind( null, field.name ) }
            value={self.props.values[ field.name ]}
          />
        </div>

      } else if ( field.fieldType == 'checkbox' ) {

        return <div className="margin-v-md">
          <CheckboxField
          name= { field.name }
          field= { field }
          lang= { self.props.lang } 
          value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
          label= { field.label }
          handleUpdate= { self.props.onChange.bind( null, field.name ) } /></div>;

      } else if ( field.fieldType == 'radio' ) {

        return <div className="margin-v-md">
          <RadioFields
            name= { field.name }
            type= "radio"
            field= { field }
            lang= { self.props.lang }
            info= { field.info } 
            value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
            error= { self.props.errors[ field.name ] || false }
            label= { field.label }
            onChange= { self.props.onChange.bind( null, field.name ) } />
        </div>

      } else if ( field.fieldType == 'select' ) {

        return <div className="margin-v-md">
          <SelectField
            name= { field.name }
            field= { field }
            lang= { self.props.lang }
            info= { field.info } 
            value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
            error= { self.props.errors[ field.name ] || false }
            label= { field.label }
            onChange= { self.props.onChange.bind( null, field.name ) } />
        </div>

      } else if ( field.fieldType == 'multichoice' ) {

        return <div className="margin-v-md">
          <RadioFields
            name= { field.name }
            type= "checkbox"
            field= { field }
            lang= { self.props.lang }
            info= { field.info } 
            value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
            error= { self.props.errors[ field.name ] || false }
            label= { field.label }
            onChange= { self.props.onChange.bind( null, field.name ) } />
        </div>

      } else if ( field.fieldType == 'image' ) {

        return <div className="margin-v-md">
          <ImageUpload
            className="upload"
            name={ field.name }
            upload={ self.props.res.upload.replace( '{field}', field.name ) }
            remove={ self.props.res.remove.replace( '{field}', field.name ) }
            lang={ self.props.lang }
            value={ self.props.values[ field.name ] ? self.props.res.path + self.props.values[ field.name ] : '' }
            label={ field.label }
            info={ field.info }
            buttonLabel={ self.props.labels.uploadButton }
            copyButton={!!field.copy}
            buttonClass="blue button"
            removeClass="red button"
            handleUpdate={ self.onImageChange( field.name ) } />
        </div>

      } else if ( field.fieldType === 'file' ) {

        return <div className="margin-v-md">
          <FileUpload
            name={ field.name }
            label={ field.label }
            optional= { field.optional }
            path={ self.props.res.path }
            value={ self.props.values[ field.name ] }
            onChange={ self.props.onChange.bind( null, field.name ) }
            upload={ self.props.res.upload.replace( '{field}', field.name ) }
            remove={ self.props.res.remove.replace( '{field}', field.name ) }
            extension={ field.extension }
          />  
        </div>

      }

    };

    return (
      <div className="custom-fields">
        {this.props.fields.map( createField )}
        <div className="separator"></div>
      </div>
    );

  }

});