import React, { useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useMemoOne } from 'react-use';
import getMultiLanguageLabel from '../../utils/getMultiLanguageLabel';
import readClipboard from '../../utils/readClipboard';
import messages from './messages';
import RuleItem from './RuleItem';

export default function List({
  aggregatorAgendaSchema,
  sourceSchema,
  isAggregator,
  rules,
  addRules,
  removeRule,
  setMode
}) {
  const intl = useIntl();

  const requiredFields = useMemoOne(
    () => aggregatorAgendaSchema.fields.filter(field => {
      if (isAggregator) {
        return false;
      }

      const sourceField = sourceSchema?.fields?.find(
          v => v.schemaId
            && v.field === field.field
            && v.schemaId === field.schemaId
        );

      if (sourceField) {
        return false;
      }

      return field.fieldType !== 'abstract' && field.optional === false;
    }),
    [aggregatorAgendaSchema.fields, isAggregator, sourceSchema]
  );

  const requiredFieldList = useMemo(
    () => requiredFields.map(field => (
      <em key={field.field}>
        {getMultiLanguageLabel(field.label, intl.locale)}
      </em>
    )),
    [intl.locale, requiredFields]
  );

  const pasteRules = useCallback(async () => {
    addRules(await readClipboard().catch(() => null));
  }, [addRules]);

  const setModeAdd = useCallback(() => setMode('add'), [setMode]);
  const setModeUpdate = useCallback(id => setMode('update', { id }), [setMode]);

  return (
    <div className="margin-top-md">
      <p className="margin-top-sm">
        {intl.formatMessage(messages.description, { br: <br key="br" /> })}
      </p>

      {sourceSchema && requiredFieldList.length ? (
        <p>
          {intl.formatMessage(messages.requiredFieldsWarning, {
            fields: intl.formatList(requiredFieldList),
            fieldsCount: requiredFields.length
          })}
        </p>
      ) : null}

      {rules.map(rule => (
        <RuleItem
          key={rule.id}
          rule={rule}
          onUpdate={setModeUpdate}
          onRemove={removeRule}
          sourceSchema={sourceSchema}
        />
      ))}

      <div>
        <p>
          <button
            type="button"
            className="btn-link-inline"
            onClick={setModeAdd}
          >
            <i className="fa fa-sm fa-plus" aria-hidden="true" />{' '}
            {intl.formatMessage(messages.addARule)}
          </button>
        </p>

        {sourceSchema ? (
          <p>
            {navigator?.clipboard?.readText ? (
              <button
                type="button"
                className="btn-link-inline"
                onClick={pasteRules}
              >
                <i className="fa fa-sm fa-paste" aria-hidden="true" />{' '}
                {intl.formatMessage(messages.pasteRules)}
              </button>
            ) : (
              <em className="text-muted">
                <i className="fa fa-sm fa-paste" aria-hidden="true" />{' '}
                {intl.formatMessage(messages.manualPasteRules)}
              </em>
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}
