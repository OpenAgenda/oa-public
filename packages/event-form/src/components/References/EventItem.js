"use strict";

import _ from 'lodash';

import React, { Component } from 'react';

export default class EventItem extends Component {

  onClick( e ) {

    e.preventDefault();

    const { event, onClick } = this.props;
    const eventUrl = `/events/${event.uid}`;

    if ( !onClick ) {

      return window.open( eventUrl, '_blank' );

    }

    onClick( event );

  }

  onRemove( e ) {

    e.preventDefault();

    const { event } = this.props;

    if ( !this.props.onRemove ) return;

    this.props.onRemove( event );

  }

  flatten( value ) {

    if ( !_.isObject( value ) ) return value;

    return _.get( value, this.props.lang, _.get( value, _.first( _.keys( value ) ) ) );

  }

  render() {

    const { event } = this.props;

    const removable = !!this.props.onRemove;

    return <div className="media">
      { removable ? <a href="#" className="pull-right remove" onClick={ this.onRemove.bind( this ) }>
        <i className="fa fa-trash"></i>
      </a> : null }
      <div className="media-body" onClick={this.onClick.bind( this )}>
        <a href="#">
          <h4 className="media-heading">{ this.flatten( event.title, this.props.lang ) }</h4>
          <ul className="list-unstyled">
            <li>{ _.get( event, 'location.name' ) }, { _.get( event, 'location.address' ) }</li>
            <li>{ this.flatten( event.dateRange, this.props.lang ) }</li>
          </ul>
        </a>
      </div>
    </div>

  }

}
