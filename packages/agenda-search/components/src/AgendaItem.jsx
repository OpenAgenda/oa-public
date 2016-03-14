"use strict";

var React = require( 'react' );

module.exports = React.createClass( {

  propTypes: {
    agenda: React.PropTypes.object
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
          <h4 className="title media-heading">{this.props.agenda.title}</h4>
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