"use strict";

const _ = require('lodash');

var React = require( 'react' ),

  getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/agenda-search' ) ),

  PropTypes = require( 'prop-types' ),

  createReactClass = require( 'create-react-class' ),

  url = require( '../../service/lib/url' );

module.exports = createReactClass( {

  displayName: 'AgendaItem',

  propTypes: {
    agenda: PropTypes.object,
    lang: PropTypes.string
  },

  render() {
    const href=url.agenda(this.props.agenda, {
      lang: this.props.lang
    });

    const isContributive = !![0, 1].includes(_.get(this.props.agenda, 'settings.contribution.type'));

    return <div className="agenda-item media">
      <div className="media-left">
        <a href={href}>
          <img
            className="media-object ill avatar"
            src={this.props.agenda.image}
            alt={this.props.agenda.title}
          />
        </a>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          {this.props.agenda.network ? <div className="network">
            <a href={url.network(this.props.agenda.network)}>{this.props.agenda.network.title} ›</a>
          </div> : null }
          <a href={href}>
            <strong>{this.props.agenda.title}</strong>
          </a>
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
        <a href={href}>
          <p className="description">{this.props.agenda.description}</p>
          <ul class="list-inline">
            { this.props.agenda.upcomingPublishedEvents === 0 && this.props.agenda.publishedEvents === 1 ? <li><span className="badge badge-default">{getLabel( 'publishedEvent', this.props.lang )}</span></li> : null }
            { this.props.agenda.upcomingPublishedEvents === 0 && this.props.agenda.publishedEvents > 1 ? <li><span className="badge badge-default">{getLabel( 'publishedEvents', { count: this.props.agenda.publishedEvents }, this.props.lang )}</span></li> : null }
            { this.props.agenda.upcomingPublishedEvents === 1 ? <li><span className="badge badge-info">{getLabel( 'upcomingEvent', this.props.lang )}</span></li> : null }
            { this.props.agenda.upcomingPublishedEvents > 1 ? <li><span className="badge badge-info">{getLabel( 'upcomingEvents', { count: this.props.agenda.upcomingPublishedEvents }, this.props.lang )}</span></li> : null }
            { isContributive ? <li><a href={url.contribute(this.props.agenda, {
              lang: this.props.lang
            })}>{getLabel('addEvent', this.props.lang )}</a></li> : null }
          </ul>
        </a>
      </div>
    </div>

  }

} );
