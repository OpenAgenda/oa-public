"use strict";

var React = require( 'react' ),

getLabel = require( 'labels' )( require( 'labels/agenda-search' ) );

module.exports = React.createClass( {

  propTypes: {
    agenda: React.PropTypes.object,
    lang: React.PropTypes.string
  },

  render: function() {

    return <div className="agenda-item media">
      <a>
        <div className="media-left">
          <img 
            className="media-object ill avatar" 
            src={this.props.agenda.image}
            alt={this.props.agenda.title} 
          />
        </div>
        <div className="media-body">
          <div className="title media-heading">
            <h4>{this.props.agenda.title}</h4>
            {this.props.agenda.verified ? <span className="badge badge-primary">{getLabel( 'verified', this.props.lang )}</span> : null }
          </div>
          <p className="description">{this.props.agenda.description}</p>
          <div>
            <span>événements: {this.props.agenda.publishedEvents}</span> / 
            <span>à venir: {this.props.agenda.upcomingPublishedEvents}</span>
          </div>
        </div>
      </a>
    </div>

  }

} );