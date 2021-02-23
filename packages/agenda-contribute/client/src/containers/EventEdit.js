import React from 'react';
import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';

import labels from '@openagenda/labels/agenda-contribute/event';
import makeLabelGetter from '@openagenda/labels';

import Instructions from '../components/Instructions';
import RequestEditionRights from '../components/RequestEditionRights'
import ButtonSpinner from '../components/ButtonSpinner';
import Canvas from '../components/Canvas';
import getHasAdditionalFields from '../lib/hasAdditionalFields';

import reducers from '../reducers';

import eventFormProps from '../lib/eventFormProps';

const getLabel = makeLabelGetter(labels);

export default connect(
  state => state,
  dispatch => ({
    onUpdateSuccess: (values, response) => dispatch(reducers.event.updated(values, response)),
    onClose: () => dispatch(reducers.event.close()),
    onDidMount: () => dispatch(reducers.landing.evaluate('edit'))
  })
)(({
  config,
  event,
  onUpdateSuccess,
  onClose,
  onDidMount,
  member
}) => {

  const hasAdditionalFields = getHasAdditionalFields(config.schemaExtensions);

  return <Canvas
    mode="edit" 
    onDidMount={onDidMount} 
    lang={config.lang}
    event={event}
  >
    <Instructions
      className="margin-bottom-lg"
      message={config?.event?.message}
    />
    <div className="wsq">
      {config.authorizations.canEditEvent ? null : <div>
        <RequestEditionRights
          hasAdditionalFields={hasAdditionalFields}
          agenda={config.agenda}
          event={event}
          lang={config.lang}
        />
      </div>}
      {hasAdditionalFields || config.authorizations.canEditEvent ? <EventForm
        includeEventFields={config.authorizations.canEditEvent}
        {...eventFormProps({ member, config })}
        values={event}
        onSubmitSuccess={onUpdateSuccess}
        actionComponents={[{
          position: 'bottom',
          Component: ({ onSubmit, loading }) => <div 
            className="wsq padding-all-md"
          >
            <button
              className="btn btn-primary btn-block"
              disabled={loading}
              onClick={onSubmit}
            >{getLabel('update', config.lang)}</button>
            {loading && <ButtonSpinner />}
          </div>
        }]}
      /> : <div className="padding-all-md text-center">
        <button
          className="btn btn-default"
          onClick={onClose}
        >{getLabel('close', config.lang)}</button>
      </div>}
    </div>
  </Canvas>
});