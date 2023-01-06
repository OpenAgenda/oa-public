import React, { useState } from 'react';
import ReactDom from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import { useConstant } from '@openagenda/react-shared';
import MemberForm from '@openagenda/member-apps/dist/components/Form';
import { locales as memberAppsLocals } from '@openagenda/member-apps/src';

import { IntlProvider, defineMessages, useIntl } from 'react-intl';
import packageLocales from '../../locales-compiled';

import {
  formatAdditionalFieldData
} from './additionalFields.utils';

const locales = mergeLocales(packageLocales, memberAppsLocals);

const messages = defineMessages({
  title: {
    id: 'event/contributor-section',
    defaultMessage: 'Contributor'
  },
  privateSection: {
    id: 'event/private-section',
    defaultMessage: 'Private information'
  },
  organization: {
    id: 'event/contributor/organization',
    defaultMessage: 'Organization'
  },
  position: {
    id: 'event/contributor/position',
    defaultMessage: 'Position'
  },
  name: {
    id: 'event/contributor/name',
    defaultMessage: 'Name'
  },
  role: {
    id: 'event/contributor/role',
    defaultMessage: 'Role'
  },
  email: {
    id: 'event/contributor/email',
    defaultMessage: 'Email'
  },
  phone: {
    id: 'event/contributor/phone',
    defaultMessage: 'Phone'
  },
  updateContributorInfo: {
    id: 'event/contributor/edit',
    defaultMessage: 'Edit'
  },
  emptyContactInfo: {
    id: 'event/contributor/emptyContactInfo',
    defaultMessage: 'No contact information available'
  }
});

const getMemberInfo = (member, schema, lang) => {
  const additionalFields = formatAdditionalFieldData(schema, member, lang);
  return additionalFields
  .filter(f => !!member[f.key])
  .map(e => ({
    key: e.key,
    label: e.label,
    value: e.value,
  }))
};

function ContributorSection({ me, member, agendaUid, lang, GDPRInformation, schema }) {
  const m = useIntl().formatMessage;
  const [displayEditModal, setDisplayEditModal] = useState(false);
  const [memberInfo, setMemberInfo] = useState(getMemberInfo(member, schema, lang));

  const canEdit = ['administrator', 'contributor'].includes(me.member.role) || (me.member.userUid === member.userUid);
  const memberIsAdminMod = ['administrator', 'moderator'].includes(member.role);

  const queryClient = useConstant(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <>
      {displayEditModal ? <QueryClientProvider client={queryClient}>
        <MemberForm
          lang={lang}
          operation="update"
          mode="modal"
          optionalFields={memberIsAdminMod}
          schema={schema}
          GDPR={{
            display: !memberIsAdminMod,
            moreInfo: GDPRInformation
          }}
          showSuccessMessage
          res={`/api/agendas/${agendaUid}/members/${member.userUid}`}
          onSuccess={update => setMemberInfo(getMemberInfo(update, m))}
          onCloseModalRequest={() => setDisplayEditModal(false)}
        />
      </QueryClientProvider>
        : null}
      <div className="event-secondary">
        <h3 className="privateable">
          <span>{m(messages.title)}</span>
          <div className="private-label">
            <i className="fa fa-unlock-alt"></i>&nbsp;
            <span>{m(messages.privateSection)}</span>
          </div>
        </h3>
        <div className="event-content">
          <dl className="event-content-section event-item-info">
            {canEdit ? <dd className="pull-right">
              <button
                className="btn btn-default"
                onClick={() => setDisplayEditModal(true)}
              >{m(messages.updateContributorInfo)}</button>
            </dd> : null}
            {memberInfo.length ? memberInfo.map(({ label, value, key }) => (
              <div className="margin-top-sm" key={`member-info-${key}`}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>)) : <dd className="margin-v-xs">{m(messages.emptyContactInfo)}</dd>}
          </dl>
        </div>
      </div>
    </>
  );
}

export default function ContributionCanvas(options) {
  const {
    lang,
    member
  } = options;

  const canvasElem = document.querySelector('.js_contributor');

  if (!canvasElem || !member) {
    return;
  }

  ReactDom.render(
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <ContributorSection {...options} />
    </IntlProvider>,
    canvasElem
  );
}
