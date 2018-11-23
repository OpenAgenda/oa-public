import createReactClass from 'create-react-class';
import React from 'react';
import Wysiwyg from './Wysiwyg.jsx';
import MultilingualTextField from './MultilingualTextField.jsx';
import TextField from './TextField.jsx';
import CheckboxField from './CheckboxField.jsx';
import RadioFields from './RadioFields.jsx';
import SelectField from './SelectField.jsx';
import ImageUpload from '@openagenda/image-upload/components/build/ImageUploader';
import HTMLComponent from '@openagenda/react-form-components/build/HTMLComponent';
import FileUpload from './FileUpload.jsx';
import classNames from 'classnames';

export default createReactClass({

  render: function() {

    const field = this.props.field;

    //console.log( 'CustomField.render', field.name, this.props.error );

    if ( [ 'integer', 'text', 'textarea', 'number', 'url', 'email' ].indexOf( field.fieldType ) !== -1 ) {

      if ( field.multilingual ) {

        return <div className={classNames( {
          'multilingual-input-field' : true,
          'form-group' : true,
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
          <MultilingualTextField
            name={ field.name }
            constraints= { field }
            label= { field.label }
            info= { field.info }
            optional= { field.optional }
            lang= { this.props.lang }
            type= { field.fieldType }
            value= { this.props.value ? this.props.value : {} }
            error= { this.props.error || false }
            languages= { this.props.languages }
            onChange= { this.props.onChange } />
          </div>;

      } else {

        return <div className={classNames( {
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
          <TextField
            name= { field.name }
            constraints= { field }
            label= { field.label }
            info= { field.info }
            placeholder = { field.placeholder }
            optional= { field.optional }
            lang= { this.props.lang }
            type= { field.fieldType }
            enriched= { !!field.enriched }
            value= { this.props.value ? this.props.value : '' }
            error= { this.props.error || false }
            onChange= { this.props.onChange } />
        </div>

      }

    } else if ( field.fieldType === 'wysiwyg' && field.multilingual ) {

      return <div className={classNames( {
          'multilingual-input-field' : true,
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
        <Wysiwyg
          name={field.name}
          lang={this.props.lang}
          label={field.label}
          placeholder={field.info}
          languages={this.props.languages}
          value={this.props.value}
          onChange={ this.props.onChange }
        />
      </div>

    } else if ( field.fieldType === 'wysiwyg' ) {

      return <div className={classNames( {
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
        <HTMLComponent
          lang={this.props.lang}
          label={field.label[ this.props.lang]}
          placeholder={field.info[ this.props.lang ]}
          onChange={ this.props.onChange }
          value={this.props.value}
        />
      </div>

    } else if ( field.fieldType == 'checkbox' ) {

      return <div className={classNames( {
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
        <CheckboxField
        name= { field.name }
        field= { field }
        lang= { this.props.lang }
        value= { this.props.value ? this.props.value : '' }
        label= { field.label }
        handleUpdate= { this.props.onChange } /></div>;

    } else if ( field.fieldType == 'radio' ) {

      return <div className={classNames( {
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
        <RadioFields
          name= { field.name }
          type= "radio"
          field= { field }
          lang= { this.props.lang }
          info= { field.info }
          value= { this.props.value ? this.props.value : '' }
          error= { this.props.error || false }
          label= { field.label }
          onChange= { this.props.onChange } />
      </div>

    } else if ( field.fieldType == 'select' ) {

      return <div className={classNames( {
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
        <SelectField
          name= { field.name }
          field= { field }
          lang= { this.props.lang }
          info= { field.info }
          value= { this.props.value ? this.props.value : '' }
          error= { this.props.error || false }
          label= { field.label }
          onChange= { this.props.onChange } />
      </div>

    } else if ( field.fieldType == 'multichoice' ) {

      return <div className={classNames( {
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
        <RadioFields
          name= { field.name }
          type= "checkbox"
          field= { field }
          lang= { this.props.lang }
          info= { field.info }
          value= { this.props.value ? this.props.value : '' }
          error= { this.props.error || false }
          label= { field.label }
          onChange= { this.props.onChange } />
      </div>

    } else if ( field.fieldType == 'image' ) {

      return <div className={classNames( {
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
        <ImageUpload
          className="upload"
          name={ field.name }
          upload={ this.props.res.upload.replace( '{field}', field.name ) }
          remove={ this.props.res.remove.replace( '{field}', field.name ) }
          lang={ this.props.lang }
          value={ this.props.value ? this.props.res.path + this.props.value : '' }
          label={ field.label }
          info={ field.info }
          buttonLabel={ this.props.labels.uploadButton }
          copyButton={!!field.copy}
          buttonClass="blue button"
          removeClass="red button"
          handleUpdate={ this.props.onChange } />
      </div>

    } else if ( field.fieldType === 'file' ) {

      return <div className={classNames( {
          'margin-v-md' : true,
          'display-none' : field.hidden
        } )}>
        <FileUpload
          name={ field.name }
          label={ field.label }
          info= { field.info }
          optional= { field.optional }
          path={ this.props.res.path }
          value={ this.props.value }
          onChange={ this.props.onChange }
          upload={ this.props.res.upload.replace( '{field}', field.name ) }
          remove={ this.props.res.remove.replace( '{field}', field.name ) }
          extension={ field.extension }
        />
      </div>

    } else {

      return <p>xoxoxoxoxoxoxoxoxoxoxo</p>

    }



  }

} );
