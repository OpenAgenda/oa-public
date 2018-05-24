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
  getTimeBrackets,
  getMonth,
  spreadEventsOnDateTimings,
  flattenTargetedLabels,
  appendMoreItem
} from './utils';

BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);

export default class Main extends Component {

  constructor( props ) {

    super(props);

    this.state = {
      events: null,
      labels: flattenLabels( labels, this.props.lang ),
      displayedDate: new Date
    }

  }

  componentDidMount() {

    this.get( new Date );

  }

  get( d, view = 'month' ) {

    this.setState( {
      view,
      loading: true
    } );

    const [ gte, lte ] = getTimeBrackets( view, d );

    console.log( 'getting for bracket', view, [ gte, lte ] );

    get( this.props.res.search, this.props.agendaUid, {
      size: 0,
      date: {
        lte,
        gte
      },
      detailed: true,
      aggregations: [ view === 'month' ? 'eventsByMonthlyDay' : 'eventsByWeeklyDay' ]
    } ).then( result => {

      const events = result.aggregations.days.reduce( ( acc, cur ) => {

        let parsedItems = spreadEventsOnDateTimings( cur.sampleEvents, cur.key )
          // multilingual content can be flattened to one language
          .map( flattenTargetedLabels.bind( null, [ 'title', 'dateRange', 'keywords' ], this.props.lang ) )
          // the type can discriminate event items from others
          .map( e => _.extend( e, { type: 'event' } ) )

        if ( cur.count > parsedItems.length ) {

          parsedItems = appendMoreItem( this.state.labels, parsedItems, view );

        }

        return acc.concat( this.state.view === 'month' ? _.uniqBy( parsedItems, 'key' ) : parsedItems )

      }, [] );

      this.setState( {
        events,
        loading: false,
        displayedDate: d
      } );

    } );

  }

  onSelectMore( more ) {

    if ( !window ) return;

    const win = window.open(
      this.props.res.agenda
      .replace( '{agendaUid}', this.props.agendaUid )
      + '?oaq[from]=' + more.key
      + '&oaq[to]=' + more.key );

      win.focus();

  }

  onSelectEvent( event ) {

    if ( !window ) return;

    const win = window.open(
      this.props.res.event
      .replace( '{agendaUid}', this.props.agendaUid )
      .replace( '{eventUid}', event.uid ), 
      '_blank'
    );

    win.focus();

  }

  onView( newView ) {

    this.get( this.state.displayedDate, newView );

  }

  onNavigate( newDate, view, direction ) {

    console.log( 'onNavigate', newDate, view, direction );

    this.get( newDate, view );

  }

  render() {

    return <div className="container wsq top-margined">
      <div className="row">
        { this.state.events ? <div className="padding-v-lg padding-h-lg">
          <BigCalendar
            views={['month', 'week']}
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
            onView={ this.onView.bind( this ) }
            messages={ this.state.labels }
            onSelectEvent= { item => item.type === 'more' ? this.onSelectMore( item ) : this.onSelectEvent( item ) }
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
  res: PropTypes.object,
  lang: PropTypes.string.isRequired,
  agendaUid: PropTypes.number.isRequired
}

Main.defaultProps = {
  res: {
    agenda: 'https://openagenda.com/agendas/{agendaUid}',
    search: 'https://openagenda.com/agendas/{agendaUid}/events.v2.json',
    event: 'https://openagenda.com/agendas/{agendaUid}/events/{eventUid}'
  },
  lang: 'en'
}

const config = JSON.parse( document.getElementById( 'config' ).innerHTML );

render( <Main {...config} />, document.getElementById( 'app' ) );