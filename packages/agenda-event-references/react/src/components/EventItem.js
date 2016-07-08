"use strict";

import React from 'react';

module.exports = React.createClass( {

  propTypes: {
    event: React.PropTypes.object,
    onRemove: React.PropTypes.func,
    onClick: React.PropTypes.func
  },

  onClick( e ) {

    if ( this.props.onClick ) {

      e.preventDefault();

      this.props.onClick( this.props.event );

    }

  },

  onRemove( e ) {

    e.preventDefault();

    if ( !this.props.onRemove ) return;

    this.props.onRemove( this.props.event.uid );

  },

  render() {

    return <div className="media" onClick={this.onClick} >
      { this.props.event.image ? <div className="media-left">
        <a className="event-pic" href={this.props.event.link || '#'}>
          <img className="media-object" src={this.props.event.image} />
        </a>
      </div> : null }
      { this.props.onRemove ? 
      <a href="#" className="pull-right remove" onClick={ this.onRemove }>
        <i className="fa fa-trash"></i>
      </a>
      : null }
      <div className="media-body">
        <a href={this.props.event.link || '#'}>
          <h4 className="media-heading">{ this.props.event.title }</h4>
          <ul className="list-unstyled">
            <li>{ this.props.event.location.name }, { this.props.event.location.address }</li>
            <li>{ this.props.event.dateRange }</li>
          </ul>
        </a>
      </div>
    </div>

  }

} )