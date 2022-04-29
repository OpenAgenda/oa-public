import _ from 'lodash';
import React from 'react';
import { Image } from '@openagenda/react-shared';
import { Link } from 'react-router-dom';
import { Dropdown, MenuItem } from 'react-bootstrap';

function AgendaItem({
  agenda,
  res,
  getLabel,
  onDisplayMemberForm,
  onDisplayRemoveMember,
}) {
  return (
    <div className="agenda-item media hoverable" key={agenda.uid}>
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
              className="btn btn-link padding-left-z padding-top-z"
              href={res.agendas[
                agenda.private ? 'showPrivate' : 'show'
              ].replace(':slug', agenda.slug)}
            >
              {getLabel('see')}
            </a>
          )}
          {[2, 3].includes(agenda.member.role) && (
            <Link
              to={`/${agenda.slug}/admin/events`}
              className="btn btn-link padding-left-z padding-top-z"
            >
              {agenda.member.role === 2
                ? getLabel('manage')
                : getLabel('moderate')}
            </Link>
          )}
          {[1, 2, 3].includes(agenda.member.role) && (
            <Link
              to={`/${agenda.slug}/contribute`}
              className="btn btn-link padding-left-z padding-top-z"
            >
              {getLabel('addAnEvent')}
            </Link>
          )}
          {![2, 3].includes(agenda.member.role) && _.get(agenda, 'mailto') && (
            <a
              className="btn btn-link padding-left-z padding-top-z"
              href={_.get(agenda, 'mailto')}
            >
              {getLabel('contact')}
            </a>
          )}
          {![2, 3].includes(agenda.member.role) && !_.get(agenda, 'mailto') && (
            <a
              className="btn btn-link padding-left-z padding-top-z"
              href={res.agendas.contact.replace(':slug', agenda.slug)}
            >
              {getLabel('contact')}
            </a>
          )}
          <Dropdown
            id={`agenda-${agenda.slug}-more-actions`}
            className="btn-link-dropdown"
          >
            <Dropdown.Toggle
              className="btn-link padding-left-z padding-top-z"
              bsRole="toggle"
            >
              {getLabel('otherActions')}
            </Dropdown.Toggle>
            <Dropdown.Menu bsRole="menu">
              {agenda.settings?.contribution.useFields ? (
                <MenuItem>
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => onDisplayMemberForm(agenda)}
                    title={getLabel('other')}
                  >
                    {getLabel('editMember')}
                  </button>
                </MenuItem>
              ) : null}
              <MenuItem>
                <button
                  type="button"
                  className="btn btn-link text-danger visible-on-hover"
                  onClick={() => onDisplayRemoveMember(agenda)}
                  title={getLabel('removeMemberInformation')}
                >
                  {getLabel('removeMember')}
                </button>
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

export default AgendaItem;
