import _ from 'lodash';
import React from 'react';
import { Image } from '@openagenda/react-shared';
import { Link } from 'react-router-dom';

const phpPrefix = process.env.NODE_ENV === 'development' ? '/frontend_dev.php/' : '/';

function AgendaItem({ agenda, res, getLabel }) {
  return (
    <div className="agenda-item media" key={agenda.uid}>
      <div className="media-left">
        <a href={`/${agenda.slug}${agenda.private ? '.prv' : ''}`}>
          <Image
            src={agenda.image}
            fallbackSrc={agenda.image.replace('cibuldev', 'cibul')}
            className="media-object ill avatar"
            alt={agenda.title}
          />
        </a>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          <a href={`/${agenda.slug}${agenda.private ? '.prv' : ''}`}>
            <strong>{agenda.title}</strong>

            {!!agenda.official && (
              <span className="official">
                <i />
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow" />
                  <div className="tooltip-inner">
                    {getLabel('officialAgenda')}
                  </div>
                </div>
              </span>
            )}
          </a>

          {!!agenda.private && (
            <div className="tooltip-icon">
              <i className="fa fa-unlock-alt" />
              <div className="tooltip right" role="tooltip">
                <div className="tooltip-arrow" />
                <div className="tooltip-inner">{getLabel('privateAgenda')}</div>
              </div>
            </div>
          )}
        </div>

        <div className="actions">
          {[4].includes(agenda.member.role) && (
            <a
              href={res.agendas[
                agenda.private ? 'showPrivate' : 'show'
              ].replace(':slug', agenda.slug)}
            >
              {getLabel('see')}
            </a>
          )}
          {[2, 3].includes(agenda.member.role) && (
            <>
              {agenda?.settings?.lab?.eventAdmin ? (
                <Link to={`/${agenda.slug}/admin/events`}>
                  {agenda.member.role === 2
                    ? getLabel('manage')
                    : getLabel('moderate')}
                </Link>
              ) : (
                <a href={`${phpPrefix}${agenda.slug}/admin`}>
                  {agenda.member.role === 2
                    ? getLabel('manage')
                    : getLabel('moderate')}
                </a>
              )}
            </>
          )}
          {[1, 2, 3].includes(agenda.member.role) && (
            <a
              href={(agenda.useContributeApp
                ? res.agendas.contribute
                : res.agendas.addEvent
              ).replace(':slug', agenda.slug)}
            >
              {getLabel('addAnEvent')}
            </a>
          )}
          {![2, 3].includes(agenda.member.role) && _.get(agenda, 'mailto') && (
            <a href={_.get(agenda, 'mailto')}>{getLabel('contact')}</a>
          )}
          {![2, 3].includes(agenda.member.role) && !_.get(agenda, 'mailto') && (
            <a href={res.agendas.contact.replace(':slug', agenda.slug)}>
              {getLabel('contact')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgendaItem;
