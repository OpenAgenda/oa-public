"use strict";

var React = require( 'react' ),

  getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/agenda-search' ) ),

  PropTypes = require( 'prop-types' ),

  createReactClass = require( 'create-react-class' ),

  url = require( '../../service/url' );

module.exports = createReactClass( {

  displayName: 'AgendaItem',

  propTypes: {
    agenda: PropTypes.object,
    lang: PropTypes.string
  },

  render() {

    return <div className="agenda-item media">
      <a href={url.agenda( this.props.agenda )}>
        <div className="media-left">
          <img 
            className="media-object ill avatar"
            src={this.props.agenda.image}
            alt={this.props.agenda.title} 
          />
        </div>
        <div className="media-body">
          <div className="title media-heading">
            <strong>{this.props.agenda.title}</strong>
            { this.props.agenda.official ? 
              <div className="official">
                <img src="//s3.eu-central-1.amazonaws.com/oastatic/official14.png" alt="officiel" />
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow"></div>
                  <div className="tooltip-inner">{getLabel( 'official', this.props.lang) }</div>
                </div>
              </div>
            : null }
          </div>
          <p className="description">{this.props.agenda.description}</p>
          <div>
            { this.props.agenda.upcomingPublishedEvents === 0 && this.props.agenda.publishedEvents === 1 ? <span className="badge badge-default">{getLabel( 'publishedEvent', this.props.lang )}</span> : null }
            { this.props.agenda.upcomingPublishedEvents === 0 && this.props.agenda.publishedEvents > 1 ? <span className="badge badge-default">{getLabel( 'publishedEvents', { count: this.props.agenda.publishedEvents }, this.props.lang )}</span> : null }
            { this.props.agenda.upcomingPublishedEvents === 1 ? <span className="badge badge-info">{getLabel( 'upcomingEvent', this.props.lang )}</span> : null }
            { this.props.agenda.upcomingPublishedEvents > 1 ? <span className="badge badge-info">{getLabel( 'upcomingEvents', { count: this.props.agenda.upcomingPublishedEvents }, this.props.lang )}</span> : null }
          </div>
        </div>
      </a>
    </div>

  }

} );