"use strict";

import React from 'react'
import PropTypes from 'prop-types'
import createReactClass from 'create-react-class'
import EventItem from './components/EventItem'
import labels from 'labels/event/references'
import makeLabelsGetter from 'labels'

let getLabel = makeLabelsGetter( labels );

export default createReactClass( {

  propTypes: {
    events: PropTypes.array,
    lang: PropTypes.string
  },

  getDefaultProps() {

    return {
      lang: 'fr'
    }

  },

  cleanEvent( event ) {

    return {
      title: event.title[ this.props.lang ],
      link: event.link || '#',
      image: event.image || false,
      location: {
        name: event.location.name,
        address: event.location.address
      },
      dateRange: event.dateRange[ this.props.lang ]
    }

  },

  render() {

    return <div className="event-references show">

      <h3>{getLabel( 'showTitle', this.props.lang )}</h3>

      <div className="wsq">

        {this.props.events.map( e => <EventItem key={e.uid} event={this.cleanEvent( e )} /> )}

      </div>

    </div>

  }

} )