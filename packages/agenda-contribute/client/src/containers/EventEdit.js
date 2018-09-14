"use strict";

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';


import EventForm from '@openagenda/event-form/build';

import labels from '@openagenda/labels/agenda-contribute/event';

import Instructions from '../components/Instructions';

import reducers from '../reducers';

export default connect(
  state => state,
  dispatch => ( {
    onUpdateSuccess: ( values, response ) => dispatch( reducers.event.updated( values, response ) ),
    onDidMount: () => dispatch( reducers.landing.evaluate( 'edit' ) )
  } )
)( props => <EventEdit {...props} /> );


class EventEdit extends Component {

  componentDidMount() {

    this.props.onDidMount( 'edit' );

  }

  render() {

    const { config, event, onUpdateSuccess, onDidMount } = this.props;

    return <div className="container">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6 margin-bottom-lg">
          <div className="text-center">
            <div className="margin-v-lg">
              <h3>{event.title[ _.first( _.keys( event.title ) ) ]}</h3>
            </div>
            <Instructions message={_.get( config, 'event.message' )} />
            <div className="padding-all-md padding-top-lg wsq">
              <EventForm 
                fileStore={config.fileStore}
                locationRes={config.locationRes}
                lang={config.lang} 
                values={event}
                onSubmitSuccess={onUpdateSuccess}
                actionComponents={[ {
                  position: 'bottom',
                  Component: ( { onSubmit } ) => <div className="form-group">
                    <button onClick={onSubmit} className="btn btn-primary btn-block">{labels.update[ config.lang ]}</button>
                  </div>
                } ]}
              />
            </div>
          </div>
        </div>
      </div> 
    </div>

  }

}
