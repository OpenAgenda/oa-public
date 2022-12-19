import _ from 'lodash';
import { Image, Dropdown } from '@openagenda/react-shared';
import { Link } from 'react-router-dom';

import axios from 'axios';

const loadSchemaAndOpenModal = (agenda, res, onDisplayMemberForm) => {
  axios.get(res.memberSchema.replace(':agendaUid', agenda.uid)).then(r => {
    onDisplayMemberForm({ ...agenda, schema: r.data.merged });
  });
};

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
            className="dropdown btn-link-dropdown open"
            Trigger={props => (
              <button
                {...props}
                className="btn btn-link padding-top-z padding-left-z"
                type="button"
              >
                {getLabel('otherActions')}&nbsp;
                <span className="caret" />
              </button>
            )}
          >
            <ul className="list-unstyled margin-v-xs">
              {agenda.settings?.contribution.useFields ? (
                <li key="edit-member-action">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() =>
                      loadSchemaAndOpenModal(agenda, res, onDisplayMemberForm)} // onDisplayMemberForm(agenda)}
                    title={getLabel('other')}
                  >
                    {getLabel('editMember')}
                  </button>
                </li>
              ) : null}
              <li key="remove-me-from-agenda-action">
                <button
                  type="button"
                  className="btn btn-link text-danger visible-on-hover"
                  onClick={() => onDisplayRemoveMember(agenda)}
                  title={getLabel('removeMemberInformation')}
                >
                  {getLabel('removeMember')}
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

export default AgendaItem;
