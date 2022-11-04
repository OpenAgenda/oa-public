import React, {
  useState,
  useEffect,
} from 'react';

import { defineMessages, useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import {
  Spinner,
  useLayoutData,
} from '@openagenda/react-shared';
import FormSchemaBuilder from '@openagenda/form-schemas/client/build/FormSchemaBuilder';
import EnabledRanges from '@openagenda/event-form/build/components/configuration/EnabledRanges';
import getSchemaFieldCount from '../lib/getSchemaFieldCount';
import useRes from '../hooks/useRes';
import useEventSchemas from '../hooks/useEventSchemas';

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
  canAddField: {
    id: 'AgendaSchema.canAddField',
    defaultMessage: 'You can add the field of your choice to the event form',
  },
});

function Dashboard() {
  const { lang, agenda } = useLayoutData();
  const maxFields = agenda?.credentials?.premiumCustomFields ? 100 : 1;
  const editableParents = agenda?.credentials?.premiumCustomFields || ['timings'];
  const intl = useIntl();
  const res = useRes(agenda);
  const { schema, parents, isLoading } = useEventSchemas(agenda);
  const [currentFieldCount, setCurrentFieldCount] = useState(getSchemaFieldCount(schema));
  const queryClient = useQueryClient();

  useEffect(() => {
    if (schema?.fields) setCurrentFieldCount(getSchemaFieldCount(schema));
  }, [schema]);

  const onSuccess = () => {
    console.log('on success clear cache');
    queryClient.removeQueries(['agenda-eventSchema', agenda.uid], { exact: true });
  };

  const onUpdate = updatedSchema => {
    setCurrentFieldCount(getSchemaFieldCount(updatedSchema));
  };

  const renderHeadComponent = () => (
    <div className="padding-all-sm">
      <label htmlFor="adaptForm-label">{intl.formatMessage(messages.adaptForm)}</label>
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

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <FormSchemaBuilder
        res={res.eventSchema}
        lang={lang}
        addEnabled={maxFields > currentFieldCount}
        settingsEnabled
        editableExtentions={editableParents}
        devState={{
          // editedField: 'title'
        }}
        schema={schema}
        extendedFrom={parents}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        renderHead={renderHeadComponent}
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
  );
}

export default Dashboard;
