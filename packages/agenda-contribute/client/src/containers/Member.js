"use strict";

import React from 'react';

import { connect } from 'react-redux';

import labels from '@openagenda/labels/agenda-contribute/member';
import FormSchemaComponent from '@openagenda/form-schemas/client/build';

import reducers from '../reducers';

import Canvas from '../components/Canvas';

import memberSchema from '../lib/memberSchema';

import deduceSteps from '../lib/deduceSteps';

// container bit
export default connect(
  state => deduceSteps( 'member', state ),
  dispatch => ( {
    onSuccess: member => dispatch( reducers.member.updated( member ) ),
    onDidMount: () => dispatch( reducers.landing.evaluate( 'member' ) ),
    onSelectStep: step => dispatch( reducers.landing.evaluate( step, true ) )
  } )
)( ( { config, member, onSuccess, onDidMount, onSelectStep, steps } ) => <Canvas {...config} steps={steps} onDidMount={onDidMount} onSelectStep={onSelectStep}>
  <div className="wsq padding-all-md padding-top-sm">
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
