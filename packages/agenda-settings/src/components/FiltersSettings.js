import { useState, useMemo, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Spinner, Modal } from '@openagenda/react-shared';

import getFilterOptions from '../utils/getFilterOptions.js';
import FilterSelect from './FilterSelect.js';

const messages = defineMessages({
  publicLabel: {
    id: 'AgendaSettings.Components.FiltersSettings.publicLabel',
    defaultMessage: 'Homepage filters',
  },
  publicInfo: {
    id: 'AgendaSettings.Components.FiltersSettings.publicInfo',
    defaultMessage:
      'List of filters that are shown on the homepage. Select the filters that are most relevant for visitors viewing the contents of the agenda.',
  },
  adminLabel: {
    id: 'AgendaSettings.Components.FiltersSettings.adminLabel',
    defaultMessage: 'Administration filters',
  },
  adminInfo: {
    id: 'AgendaSettings.Components.FiltersSettings.adminInfo',
    defaultMessage:
      'List of filters that are shown on the administration events tab. Select the filters useful for moderating event contents.',
  },
  submit: {
    id: 'AgendaSettings.Components.FiltersSettings.submit',
    defaultMessage: 'Submit',
  },
  sub: {
    id: 'AgendaSettings.Components.FiltersSettings.sub',
    defaultMessage: 'Drag and drop selected items to adjust order',
  },
  cancel: {
    id: 'AgendaSettings.Components.FiltersSettings.cancel',
    defaultMessage: 'Cancel changes',
  },
  reset: {
    id: 'AgendaSettings.Components.FiltersSettings.reset',
    defaultMessage: 'Reset configuration',
  },
  resetModalTitle: {
    id: 'AgendaSettings.Components.FiltersSettings.resetModalTitle',
    defaultMessage: 'Confirm filter selection reset',
  },
  resetModalMessage: {
    id: 'AgendaSettings.Components.FiltersSettings.resetModalMessage',
    defaultMessage:
      'Are you sure? Your current filter selection will be lost and will go back to defaults',
  },
  resetModalConfirm: {
    id: 'AgendaSettings.Components.FiltersSettings.resetModalConfirm',
    defaultMessage: 'Confirm',
  },
  selectPlaceholder: {
    id: 'AgendaSettings.Components.FiltersSettings.selectPlaceholder',
    defaultMessage: 'Select one or more filters',
  },
});

const strfy = (filters) => [...filters || []].join('|');

const getHasChanges = (settings, publicFilters, adminFilters) =>
  strfy(publicFilters) !== strfy(settings.public?.filters?.displayed)
  || strfy(adminFilters) !== strfy(settings.admin?.filters?.displayed);
const getDefaultPublicFilters = (schema) => {
  const defaultFilters = ['search', 'geo', 'timings'];
  if (schema?.fields) {
    schema.fields.forEach((field) => {
      if (field.fieldType === 'event') {
        return;
      }
      if (!field.options && !['boolean'].includes(field.fieldType)) {
        return;
      }
      defaultFilters.push(field.field);
    });
  }
  return defaultFilters;
};
const loadPublicFilters = (schema, settings) =>
  settings.public?.filters?.displayed ?? getDefaultPublicFilters(schema);
const getIsAsDefault = (settings) =>
  !(settings.public?.filters?.displayed ?? []).length
  && !(settings.admin?.filters?.displayed ?? []).length;
const loadAdminFilters = (schema, settings, intl) => {
  if ((settings.admin?.filters?.displayed ?? []).length) {
    return settings.admin.filters.displayed;
  }
  return getFilterOptions(intl, schema).map((o) => o.value);
};

export default function FiltersSettings({
  schema,
  settings,
  onSubmit: onSubmitFromProps,
  loading,
}) {
  const intl = useIntl();
  const [publicFilters, setPublicFilters] = useState(
    loadPublicFilters(schema, settings),
  );
  const [adminFilters, setAdminFilters] = useState(
    loadAdminFilters(schema, settings, intl),
  );
  const [displayResetConfirm, setDisplayResetConfirm] = useState(false);

  // need to load schema here.

  const hasChanges = useMemo(
    () => getHasChanges(settings, publicFilters, adminFilters),
    [settings, publicFilters, adminFilters],
  );
  const isAsDefault = useMemo(() => getIsAsDefault(settings), [settings]);

  const onCancel = useCallback(() => {
    setPublicFilters(loadPublicFilters(schema, settings));
    setAdminFilters(loadAdminFilters(schema, settings, intl));
  }, [schema, settings, intl]);

  const onSubmit = useCallback(() => {
    onSubmitFromProps({
      public: { filters: { displayed: publicFilters } },
      admin: { filters: { displayed: adminFilters } },
    });
  }, [publicFilters, adminFilters, onSubmitFromProps]);

  const onReset = useCallback(() => {
    const resetPublicFilters = getDefaultPublicFilters(schema);
    const resetAdminFilters = getFilterOptions(intl, schema).map(
      (o) => o.value,
    );
    setDisplayResetConfirm(false);
    setPublicFilters(resetPublicFilters);
    setAdminFilters(resetAdminFilters);
    onSubmitFromProps({
      public: { filters: { displayed: null } },
      admin: { filters: { displayed: null } },
    });
  }, [intl, schema, onSubmitFromProps]);

  const m = (c) => intl.formatMessage(messages[c]);

  return (
    <>
      <div className="margin-v-sm">
        <strong>{m('publicLabel')}</strong>
        <div>{m('publicInfo')}</div>
        <FilterSelect
          value={publicFilters}
          schema={schema}
          disabled={loading}
          exclude={['viewport', 'memberUid', 'search', 'geo']}
          placeholder={m('selectPlaceholder')}
          onChange={(update) => {
            setPublicFilters(update);
          }}
          sub={m('sub')}
        />
      </div>
      <div className="margin-v-sm">
        <strong>{m('adminLabel')}</strong>
        <div>{m('adminInfo')}</div>
        <FilterSelect
          value={adminFilters}
          schema={schema}
          exclude={['viewport', 'search']}
          disabled={loading}
          placeholder={m('selectPlaceholder')}
          onChange={(update) => {
            setAdminFilters(update);
          }}
          sub={m('sub')}
        />
      </div>
      <div className="margin-v-sm">
        <button
          disabled={!hasChanges || loading}
          type="button"
          className="btn btn-primary margin-right-xs"
          onClick={onSubmit}
        >
          {m('submit')}
        </button>
        <button
          type="button"
          className="btn btn-default margin-right-xs"
          disabled={loading || !hasChanges}
          onClick={onCancel}
        >
          {m('cancel')}
        </button>
        <button
          type="button"
          className="btn btn-default pull-right"
          disabled={loading || isAsDefault}
          onClick={() => setDisplayResetConfirm(true)}
        >
          {m('reset')}
        </button>
        {loading ? <Spinner mode="inline" color="white" /> : null}
        {displayResetConfirm ? (
          <Modal
            title={m('resetModalTitle')}
            classNames={{
              title: 'popup-title padding-bottom-z',
            }}
            onClose={() => setDisplayResetConfirm(false)}
          >
            <div>{m('resetModalMessage')}</div>
            <div className="text-center padding-top-sm">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onReset}
              >
                {m('resetModalConfirm')}
              </button>
            </div>
          </Modal>
        ) : null}
      </div>
    </>
  );
}
