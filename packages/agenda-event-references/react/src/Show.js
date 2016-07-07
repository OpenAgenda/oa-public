"use strict";

import React, { PropTypes } from 'react'
import EventItem from './components/EventItem'
import labels from 'labels/event/references'
import makeLabelsGetter from 'labels'

let getLabel = makeLabelsGetter( labels );

export default React.createClass( {

  propTypes: {
    events: PropTypes.array,
    lang: PropTypes.string
  },

  getDefaultProps() {

    return {
      lang: 'fr'
    }

  },

  translateEvent( event ) {

    return {
      title: event.title[ this.props.lang ],
      location: {
        name: event.location.name,
        address: event.location.address
      },
      dateRange: event.dateRange[ this.props.lang ]
    }

  },

  render() {

    return <div className="event-references">

      <h3>{getLabel( 'showTitle', this.props.lang )}</h3>
      {this.props.events.map( e => <EventItem event={this.translateEvent( e )} /> )}

    </div>

  }

} )