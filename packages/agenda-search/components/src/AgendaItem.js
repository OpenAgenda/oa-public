import _ from 'lodash';
import React, { Component } from 'react';
import labels from '@openagenda/labels/agenda-search';
import makeLabelGetter from '@openagenda/labels';

import PropTypes from 'prop-types';
import url from '../../service/lib/url';

const getLabel = makeLabelGetter(labels);

class AgendaItem extends Component {
  render() {
    const {
      agenda,
      lang
    } = this.props;

    const href=url.agenda(agenda, { lang });
    const isContributive = !![0, 1].includes(_.get(agenda, 'settings.contribution.type'));

    return <div className="agenda-item media">
      <div className="media-left">
        <a href={href}>
          <img
            className="media-object ill avatar"
            src={agenda.image}
            alt={agenda.title}
          />
        </a>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          {agenda.network ? <div className="network">
            <a href={url.network(agenda.network)}>{agenda.network.title} ›</a>
          </div> : null }
          <a href={href}>
            <strong>{agenda.title}</strong>
          </a>
          { agenda.official ?
            <div className="official">
              <img src="//s3.eu-central-1.amazonaws.com/oastatic/official14.png" alt="officiel" />
              <div className="tooltip right" role="tooltip">
                <div className="tooltip-arrow"></div>
                <div className="tooltip-inner">{getLabel('official', lang) }</div>
              </div>
            </div>
          : null }
        </div>
        <a href={href}>
          <p className="description">{agenda.description}</p>
        </a>
        <ul className="list-inline">
          { agenda.upcomingPublishedEvents === 0 && agenda.publishedEvents === 1 ? <li className="margin-bottom-xs"><span className="badge badge-default">{getLabel('publishedEvent', lang)}</span></li> : null }
          { agenda.upcomingPublishedEvents === 0 && agenda.publishedEvents > 1 ? <li className="margin-bottom-xs"><span className="badge badge-default">{getLabel('publishedEvents', { count: agenda.publishedEvents }, lang)}</span></li> : null }
          { agenda.upcomingPublishedEvents === 1 ? <li className="margin-bottom-xs"><span className="badge badge-info">{getLabel('upcomingEvent', lang)}</span></li> : null }
          { agenda.upcomingPublishedEvents > 1 ? <li className="margin-bottom-xs"><span className="badge badge-info">{getLabel('upcomingEvents', { count: agenda.upcomingPublishedEvents }, lang)}</span></li> : null }
          { isContributive ? <li className="margin-bottom-xs"><a href={url.contribute(agenda, { lang })}>{getLabel('addEvent', lang)}</a></li> : null }
        </ul>
      </div>
    </div>

  }

}

AgendaItem.propTypes = {
  agenda: PropTypes.object,
  lang: PropTypes.string
}

module.exports = AgendaItem;
