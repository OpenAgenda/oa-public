"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';

import React, { Component } from 'react';
import { flatten, post } from './helpers';

const Field = require( './Field' );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      values: {}
    }

    this.onSubmit = this.onSubmit.bind( this );
    this.onSubmitConfirm = this.onSubmitConfirm.bind( this );

  }

  onSubmit( e ) {

    e.preventDefault();

    sa.post( this.props.res.post, this.state.values ).then( res => {

      if ( res.statusCode === 200 ) {

        this.setState( {
          submitted: true
        } );

      }

    } );

  }

  onSubmitConfirm( e ) {

    e.preventDefault();

    window.location.href = this.props.res.redirect;

  }

  onChange( field, value ) {

    const updateValues = {};

    updateValues[ field ] = { $set: value };

    this.setState( {
      values: ih( this.state.values, updateValues )
    } );

  }

  render() {

    const { lang } = this.props;

    const { values, submitted } = this.state;

    if ( submitted ) {

      return <div>
        <span>Done!</span>
        <button onClick={this.onSubmitConfirm}>Ok</button>
      </div>

    }

    return <div>
      {this.props.formSchema.fields.map( ( f, i ) => {

        const flatField = flatten( f, lang );

        return <Field
          type={f.fieldType}
          key={'field' + i}
          field={flatField}
          value={_.get( values, f.field, null )}
          onChange={this.onChange.bind( this, f.field )}
        />

      } )}
      <div className="form-group">
        <button className="btn btn-default" type="submit" onClick={this.onSubmit}>Done</button>
      </div>
    </div>

  }

}
