"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import FieldCounter from './FieldCounter';

const FieldComponents = {
  text: require( './TextField' ),
  textarea: require( './TextField' )
}

module.exports = class MultilingualField extends Component {

  onChange( language, value ) {

    this.props.onChange( ih( this.props.value || {}, _.set( {}, language, {
      $set: value
    } ) ) );

  }

  render() {

    const {
      field: name,
      placeholder,
      languages,
      max
    } = this.props.field;

    const {
      type
    } = this.props;

    const Component = FieldComponents[ type ];

    return <ul className="list-unstyled">
      {languages.map( l => (
        <li key={name + '_' + l}>
          <div className="lang-unit">
            <label>{l}</label>
            <div>
              <Component
                type={type}
                field={this.props.field}
                value={_.get( this.props.value, l ) }
                onChange={this.onChange.bind( this, l )} />
              {max?<FieldCounter value={_.get( this.props.value, l )} max={max}/>:null}
            </div>
          </div>
        </li>
      ) )}
    </ul>


    /*
    
    

     <div class="multilingual-input-field form-group">
      <label>label of the multilingual input</label>
      <span class="info" >Yeepeekayyay</span>
      <ul class="list-unstyled" >
        <li>
          <div class="lang-unit">
          <label >fr</label>
       <div>
         <div><input name="description_fr" type="text" value="Ouaich" class="form-control" >
          </div>
        </div>
      </div>
      </li>
      <li class="disabled">
      <div class="lang-unit">
        <label>en</label>
       <div>
         <div>
          <input name="description_en" type="text" value="Yep" class="form-control" disabled>
        </div>
        </div>
      </div>
      </li>
      <li>
      <div class="lang-unit" >
        <label >es</label>
       <div>
         <div><input name="description_es" type="text" value="Si" class="form-control" >
          </div>
        </div>
        </div>
      </li>
    </ul>
    </div>*/
  }

}