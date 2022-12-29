import {
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { useHistory, useLocation } from 'react-router';
import {
  Spinner,
  useLayoutData,
} from '@openagenda/react-shared';
import FormSchemaBuilder from '@openagenda/form-schemas/client/build/FormSchemaBuilder';
import EnabledRanges from '@openagenda/event-form/build/components/configuration/EnabledRanges';
import getSchemaFieldCount from '../lib/getSchemaFieldCount';
import useRes from '../hooks/useRes';
import useEventSchemas from '../hooks/useEventSchemas';
import useMemberSchemas from '../hooks/useMemberSchemas';
import EmbedSelection from '../components/EmbedSelection';

const completedPrefix = (agenda, prefix) => prefix.replace(':agendaSlug', agenda.slug);

const messages = defineMessages({
  network: {
    id: 'AgendaSchema.network',
    defaultMessage: 'Network',
  },
  networkDetail: {
    id: 'AgendaSchema.networkDetail',
    defaultMessage: 'Field required by the agenda network',
  },
  event: {
    id: 'AgendaSchema.event',
    defaultMessage: 'Standard',
  },
  eventDetail: {
    id: 'AgendaSchema.eventDetail',
    defaultMessage: 'Standard event field',
  },
  needMoreFields: {
    id: 'AgendaSchema.needMoreFields',
    defaultMessage: 'Need more fields?',
  },
  adaptForm: {
    id: 'AgendaSchema.adaptForm',
    defaultMessage: 'Adapt the configuration of the event form',
  },
  adaptMemberForm: {
    id: 'AgendaSchema.adaptMemberForm',
    defaultMessage: 'Adapt the configuration of the member form',
  },
  canAddField: {
    id: 'AgendaSchema.canAddField',
    defaultMessage: 'You can add the field of your choice to the form',
  },
  member: {
    id: 'AgendaSchema.member',
    defaultMessage: 'Standard Member',
  },
  memberDetail: {
    id: 'AgendaSchema.memberDetail',
    defaultMessage: 'Standard member field',
  },
});

function Dashboard() {
  const { lang, agenda, filtersContainerRef: selectionMenuContainerRef } = useLayoutData();
  const maxFields = agenda?.credentials?.premiumCustomFields ? 100 : 1;
  const memberCredential = agenda?.credentials?.memberCustom || false;
  const editableParents = agenda?.credentials?.premiumCustomFields || ['timings'];
  const prefix = completedPrefix(agenda, useSelector(state => state.settings.prefix));
  const intl = useIntl();
  const res = useRes(agenda);
  const history = useHistory();
  const historyLocation = useLocation();
  const queryClient = useQueryClient();
  const { pathname } = historyLocation;

  const { memberMode } = useMemo(() => {
    if (pathname.includes('/member') && memberCredential) {
      return { memberMode: true };
    }
    if (pathname.includes('/member')) history.push(prefix);
    return { memberMode: false };
  }, [pathname, memberCredential, history, prefix]);

  const { schema, parents, isLoading } = useEventSchemas(agenda, memberMode);
  const [currentFieldCount, setCurrentFieldCount] = useState(getSchemaFieldCount(schema));
  const { memberSchema, memberParents, isLoadingMember } = useMemberSchemas(agenda, memberMode);

  useEffect(() => {
    if (schema?.fields) setCurrentFieldCount(getSchemaFieldCount(schema));
  }, [schema]);

  const onSuccess = () => {
    if (memberMode) queryClient.removeQueries(['agenda-memberSchema', agenda.uid], { exact: true });
    else queryClient.removeQueries(['agenda-eventSchema', agenda.uid], { exact: true });
  };

  const onUpdate = updatedSchema => {
    setCurrentFieldCount(getSchemaFieldCount(updatedSchema));
  };

  const renderHeadComponent = () => (
    <div className="padding-all-sm">
      <label htmlFor="adaptForm-label">{intl.formatMessage(memberMode ? messages.adaptMemberForm : messages.adaptForm)}</label>
      {maxFields === 1 ? (
        <div>
          <p>{intl.formatMessage(messages.canAddField)}</p>
        </div>
      ) : null}
      {maxFields === 1 && maxFields === currentFieldCount ? (
        <div>
          <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=agendaSchema`}>
            {intl.formatMessage(messages.needMoreFields)}
          </a>
        </div>
      ) : null}
    </div>
  );

  if (isLoading || isLoadingMember) {
    return <Spinner />;
  }

  return (
    <div>
      {renderHeadComponent()}
      <div>
        <FormSchemaBuilder
          topSidebar
          res={memberMode ? res.memberSchema : res.eventSchema}
          lang={lang}
          addEnabled={maxFields > currentFieldCount}
          settingsEnabled
          editableExtentions={editableParents}
          devState={{
            // editedField: 'title'
          }}
          schema={memberMode ? memberSchema : schema}
          extendedFrom={memberMode ? memberParents : parents}
          onUpdate={onUpdate}
          onSuccess={onSuccess}
          // renderHead={renderHeadComponent}
          components={{
            enabledRanges: EnabledRanges,
          }}
          customFieldConfigurationSchemas={({
            timings: {
              fields: [{
                field: 'label',
                fieldType: 'abstract',
              }, {
                field: 'sub',
                fieldType: 'abstract',
              }, {
                field: 'enabledRanges',
                fieldType: 'enabledRanges',
                label: 'Configurateur des saisie de dates',
                selfHandled: ['label', 'info', 'help', 'sub'],
              }],
            },
          })}
        />
        {maxFields === 1 && maxFields === currentFieldCount ? (
          <div>
            <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=agendaSchema`}>
              {intl.formatMessage(messages.needMoreFields)}
            </a>
          </div>
        ) : null}
      </div>
      {memberCredential && selectionMenuContainerRef ? (
        <EmbedSelection
          containerRef={selectionMenuContainerRef}
          activeMenu={memberMode ? 'member' : 'event'}
          onChange={m => {
            if (memberMode && m === 'event') history.push(prefix);
            if (!memberMode && m === 'member') history.push(`${prefix}/member`);
          }}
        />
      ) : null}
    </div>
  );
}

export default Dashboard;
