"use strict";

import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import { render } from 'react-dom';
import Spinner from 'react-spinkit';
import get from './get';
import Event from './Event';

import labels from '@openagenda/labels/agendas/calendar';
import flattenLabels from '@openagenda/labels/flatten';


import {
  pickLang,
  getMonthBrackets,
  getMonth
} from './utils';

BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);

export default class Main extends Component {

  constructor( props ) {

    super(props);

    this.state = {
      loading: true,
      events: null
    };

    this.get( new Date );

  }

  get( d ) {

    const [ gte, lte ] = getMonthBrackets( d );

    get( this.props.res, this.props.agendaUid, {
      size: 0,
      date: {
        lte,
        gte
      },
      detailed: true,
      aggregations: [ 'eventsByDay' ]
    } ).then( result => {

      const events = result.aggregations.days.reduce( ( acc, cur ) => {

        const parsedEvents = acc.concat( cur.sampleEvents.reduce( ( acc, e ) => {

          return acc.concat( e.timings
            .filter( t => moment( t.begin ).format( 'YYYY-MM-DD' ) === cur.key )
            .map( t => _.extend( _.omit( e, [ 'timings' ] ), {
              title: pickLang( e.title, this.props.lang ),
              begin: new Date( t.begin ),
              end: new Date( t.end ),
              dayKey: [ cur.key, pickLang( e.title, this.props.lang ) ].join( ' - ' )
            } ) ) );

        }, [] ) );


        return this.state.view === 'month' ? _.uniqBy( parsedEvents, 'dayKey' ) : parsedEvents;

      }, [] );

      this.setState( {
        events,
        loading: false,
        displayedDate: d
      } );

    } );

  }

  onNavigate( newDate, type, direction ) {

    this.setState( {
      loading: true,
      view: type
    } );

    if ( type === 'month' ) {

      this.get( newDate );

    }

  }

  render() {

    return <div className="container wsq top-margined">
      <div className="row">
        { this.state.events ? <div className="padding-v-lg padding-h-lg">
          <BigCalendar
            {...this.props}
            events={this.state.events || []}
            step={60}
            startAccessor='begin'
            endAccessor='end'
            components={{
              event: Event
            }}
            culture={this.props.lang}
            defaultDate={this.state.displayedDate}
            onNavigate={ this.onNavigate.bind( this ) }
            messages={ flattenLabels( labels, this.props.lang ) }
          />
        </div> : null }
      </div>
      { this.state.loading ? <div className="spin-canvas">
        <Spinner name="cube-grid" color="#2494c7" fadeIn="quarter" />
      </div> : null }
      </div>
    
  }

}

Main.propTypes = {
  res: PropTypes.string,
  lang: PropTypes.string.isRequired,
  agendaUid: PropTypes.number.isRequired
}

Main.defaultProps = {
  res: 'https://openagenda.com/agendas/{agendaUid}/events.v2.json',
  lang: 'en'
}

const config = JSON.parse( document.getElementById( 'config' ).innerHTML );

render( <Main {...config} />, document.getElementById( 'app' ) );