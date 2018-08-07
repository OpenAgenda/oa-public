"use strict";

import React from 'react';

import { connect } from 'react-redux';

import labels from '@openagenda/labels/agenda-contribute/member';
import FormSchemaComponent from '@openagenda/form-schemas/client/build';

import reducers from '../reducers';

import Canvas from './Canvas';

import injectConfig from '../lib/injectConfig';
import memberSchema from '../lib/memberSchema';

// container bit
export default connect(
  state => state,
  dispatch => ( {
    onSuccess: () => dispatch( reducers.member.updated() )
  } )
)( ( { config, member, onSuccess } ) => <Canvas {...config} step="member">
  <div className="wsq padding-h-md padding-all-md padding-top-sm">
    <h3>{labels.title[ config.lang ]}</h3>
    <div className="margin-v-lg">
      <label>{labels.subtitle[ config.lang ]}</label>
      <p>{labels.description[ config.lang ]}</p>
    </div>
    <FormSchemaComponent
      values={member}
      lang={config.lang}
      schema={memberSchema}
      onSubmitSuccess={savedMemberValues => onSuccess( savedMemberValues )}
      actionComponents={[{
        position: 'bottom',
        Component: ( { onSubmit } ) => <div className="form-group">
          <div className="margin-top-md">
            <button onClick={onSubmit} className="btn btn-primary btn-block">{labels.submit[ config.lang ]}</button>
          </div>
        </div>
      }]}
    />
  </div>
</Canvas> );