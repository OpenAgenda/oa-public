import React from 'react';

import { connect } from 'react-redux';

import labels from '@openagenda/labels/agenda-contribute/member';
import { groupErrorHeader } from '@openagenda/labels/form-schemas';
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
)( ( { config, member, event, onSuccess, onDidMount, onSelectStep, steps } ) => <Canvas {...config} steps={steps} onDidMount={onDidMount} onSelectStep={onSelectStep} event={event}>
  <div className=" padding-top-sm">
    <div className="wsq padding-all-md">
      <h3>{labels.title[ config.lang ]}</h3>
      <div className="margin-top-lg">
        <label>{labels.subtitle[ config.lang ]}</label>
        <p>{labels.description[ config.lang ]}</p>
      </div>
    </div>
    <FormSchemaComponent
      values={member}
      withErrors={false}
      classNames={{
        fieldsCanvas: 'wsq padding-h-md padding-bottom-md'
      }}
      lang={config.lang}
      schema={memberSchema}
      onSubmitSuccess={savedMemberValues => onSuccess( savedMemberValues )}
      errorComponents={[{
        position: 'bottom',
        Component: ( { errors } ) =>  <div className="error-summary padding-v-sm padding-h-md">
          <div className="padding-bottom-sm">{groupErrorHeader[ config.lang ]} :</div>
          <ul className="list-unstyled">
          {errors.map( ( e, i ) => <li key={'error-' + i}>
            <label>{e.fieldLabel}</label>:&nbsp;
            <span>{e.label}</span>
          </li> )}
          </ul>
        </div>
      }]}
      actionComponents={[{
        position: 'bottom',
        Component: ( { onSubmit } ) => <div className="padding-all-md wsq">
          <div>
            <button onClick={onSubmit} className="btn btn-primary btn-block">{labels.submit[ config.lang ]}</button>
          </div>
        </div>
      }]}
    />
  </div>
</Canvas> );
