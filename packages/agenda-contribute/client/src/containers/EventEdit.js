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

  renderTitle( lang ) {

    console.log( '***' );

    console.log( lang );

    const { event } = this.props;

    const titleLanguages = _.keys( event.title );

    const eventLanguage = titleLanguages.includes( lang ) ? lang : _.first( titleLanguages );

    console.log(eventLanguage);

    const title = [];

    if ( event.draft ) title.push( labels.editDraftTitle[ lang ] );

    if ( eventLanguage ) title.push( _.get( event, [ 'title', eventLanguage ] ) );

    console.log( title );

    return <h3>{title.join( ': ' )}</h3>

  }

  render() {

    const { config, event, onUpdateSuccess, onDidMount } = this.props;

    return <div className="container">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6 margin-bottom-lg">
          <div className="text-center">
            <div className="margin-v-lg">
              {this.renderTitle( config.lang )}
            </div>
            <Instructions message={_.get( config, 'event.message' )} className="margin-bottom-lg" />
            <div className="wsq">
              <EventForm 
                withErrors={false}
                fileStore={config.fileStore}
                locationRes={config.locationRes}
                lang={config.lang} 
                values={event}
                onSubmitSuccess={onUpdateSuccess}
                classNames={{
                  fieldsCanvas: 'padding-all-md wsq padding-bottom-sm',
                  bottomErrorsCanvas: 'error-summary padding-all-md',
                }}
                actionComponents={[ {
                  position: 'bottom',
                  Component: ( { onSubmit } ) => <div className="wsq padding-all-md">
                    {event.draft && <button onClick={ e => onSubmit( e, { draft: true } )} className="btn btn-default btn-block margin-bottom-md">{labels.draft[ config.lang ]}</button> }
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
