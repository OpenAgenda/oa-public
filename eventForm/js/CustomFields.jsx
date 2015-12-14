"use strict";

var React = require( 'react' ),

TextField = require( './TextField.jsx' ),

MultilingualTextField = require( './MultilingualTextField.jsx' ),

CheckboxField = require( './CheckboxField.jsx' ),

RadioFields = require( './RadioFields.jsx' ),

SelectField = require( './SelectField.jsx' ),

ImageUpload = require( 'image-upload/lib/ImageUploader.jsx' ),

utils = require( 'utils' );

module.exports = React.createClass({

  onChange: function( field ) {

    var self = this;

    return function( value, error ) {

      self.props.onChange( field, value, error );

    }

  },

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

          return <MultilingualTextField
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
            onChange= { self.onChange( field.name ) }/>;

        } else {

          return <TextField 
            name= { field.name }
            constraints= { field }
            label= { field.label }
            info= { field.info } 
            optional= { field.optional }
            lang= { self.props.lang } 
            type= { field.fieldType } 
            value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
            error= { self.props.errors[ field.name ] || false }
            onChange= { self.onChange( field.name ) } />;

        }

      } else if ( field.fieldType == 'checkbox' ) {

        return <CheckboxField
          name= { field.name }
          field= { field }
          lang= { self.props.lang } 
          value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
          label= { field.label }
          handleUpdate= { self.onChange( field.name ) } />;

      } else if ( field.fieldType == 'radio' ) {

        return <RadioFields
          name= { field.name }
          type= "radio"
          field= { field }
          lang= { self.props.lang }
          info= { field.info } 
          value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
          error= { self.props.errors[ field.name ] || false }
          label= { field.label }
          onChange= { self.onChange( field.name ) } />;

      } else if ( field.fieldType == 'select' ) {

        return <SelectField
          name= { field.name }
          field= { field }
          lang= { self.props.lang }
          info= { field.info } 
          value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
          error= { self.props.errors[ field.name ] || false }
          label= { field.label }
          onChange= { self.onChange( field.name ) } />;

      } else if ( field.fieldType == 'multichoice' ) {

        return <RadioFields
          name= { field.name }
          type= "checkbox"
          field= { field }
          lang= { self.props.lang }
          info= { field.info } 
          value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
          error= { self.props.errors[ field.name ] || false }
          label= { field.label }
          onChange= { self.onChange( field.name ) } />;

      } else if ( field.fieldType == 'image' ) {

        // value given here should be path.
        // path can be given by EventForm & index;

        return <ImageUpload
          className="upload"
          name={ field.name }
          upload={ self.props.res.upload.replace( '{field}', field.name ) }
          remove={ self.props.res.remove.replace( '{field}', field.name ) }
          lang={ self.props.lang }
          value= { self.props.values[ field.name ] ? self.props.res.path + self.props.values[ field.name ] : '' }
          label= { field.label }
          buttonLabel= { self.props.labels.uploadButton }
          buttonClass="blue button"
          removeClass="red button"
          handleUpdate= { self.onImageChange( field.name ) } />

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