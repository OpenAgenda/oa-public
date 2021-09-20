import React from 'react';
import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';

import labels from '@openagenda/labels/agenda-contribute/event';
import makeLabelGetter from '@openagenda/labels';

import Instructions from '../components/Instructions';
import ButtonSpinner from '../components/ButtonSpinner';
import Canvas from '../components/Canvas';
import ErrorMessage from '../components/ErrorMessage';

import reducers from '../reducers';

import eventFormProps from '../lib/eventFormProps';

const getLabel = makeLabelGetter(labels);

export default connect(
  state => state,
  dispatch => ({
    onUpdateSuccess: (values, response) => dispatch(reducers.event.updated(values, response)),
    onDidMount: () => dispatch(reducers.landing.evaluate('add')),
    onCancel: event => dispatch(reducers.event.close(event))
  })
)(({
  config,
  event,
  onUpdateSuccess,
  onCancel,
  onDidMount,
  member
}) => (<Canvas
    mode="add" 
    onDidMount={onDidMount} 
    lang={config.lang}
    event={event}
    fromAgenda={config.fromAgenda}
    agenda={config.agenda}
  >
    {config?.standardFieldsErrors?.length ? (
      <ErrorMessage
        event={event}
        agenda={config.agenda}
        lang={config.lang}
        suggestChangeRes={config.suggestChangeRes}
        onCancel={onCancel}
        errors={config.standardFieldsErrors}
      />
    ) : (<div>
      <Instructions
        message={config?.event?.message}
      />
      <div className="wsq">
        <EventForm
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
              >{getLabel('confirmAdd', config.lang)}</button>
              {loading && <ButtonSpinner />}
            </div>
          }]}
        />
      </div>
    </div>
  )}
  </Canvas>
));
