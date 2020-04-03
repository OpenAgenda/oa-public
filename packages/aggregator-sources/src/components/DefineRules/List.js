import _ from 'lodash';
import React, { useState, useMemo, useCallback } from 'react';
import * as ReactIs from 'react-is';
import { useIntl } from 'react-intl';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useMemoOne } from '@openagenda/react-shared/dist/hooks/useMemoOne';
import getMultiLanguageLabel from '../../utils/getMultiLanguageLabel';
import readClipboard from '../../utils/readClipboard';
import messages from './messages';
import RuleItem from './RuleItem';
import validateActions from './validateActions';

export default function List({
  aggregatorAgenda,
  aggregatorAgendaSchema,
  sourceAgenda,
  sourceSchema,
  displayInfo,
  isAggregator,
  rules,
  addRules,
  reorderRules,
  removeRule,
  setMode,
  SubmitButton,
  onSubmit,
  onCancel
}) {
  const intl = useIntl();
  const [error, setError] = useState(null);

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

  const onDragEnd = useCallback(
    result => {
      if (!result.destination) {
        return;
      }

      reorderRules(result.source.index, result.destination.index);
    },
    [reorderRules]
  );

  return (
    <>
      <div>
        {displayInfo ? <p>
          {intl.formatMessage(messages.description, { br: <br key="br" /> })}
        </p> : null}

        {sourceSchema && requiredFieldList.length ? (
          <div class="warning-block" title={intl.formatMessage(messages.requiredFieldsWarningDetail, {
            agendaTitle: aggregatorAgenda.title
          })}>
            <b>
            {intl.formatMessage(messages.requiredFieldsWarning, {
              fields: intl.formatList(requiredFieldList),
              fieldsCount: requiredFields.length
            })}
            </b>
          </div>
        ) : null}

        {/* eslint-disable react/jsx-props-no-spreading */}
        <DragDropContext className="list-group" onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {rules.map((rule, index) => (
                  <Draggable key={rule.id} draggableId={rule.id} index={index}>
                    {provided2 => (
                      <li
                        className="list-group-item"
                        ref={provided2.innerRef}
                        {...provided2.draggableProps}
                        {...provided2.dragHandleProps}
                      >
                        <RuleItem
                          rule={rule}
                          onUpdate={setModeUpdate}
                          onRemove={removeRule}
                          sourceAgenda={sourceAgenda}
                          sourceAgendaSchema={sourceSchema}
                          aggregatorAgenda={aggregatorAgenda}
                          aggregatorAgendaSchema={aggregatorAgendaSchema}
                        />
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {/* eslint-enable */}

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

      {error ? <div className="text-danger">{error}</div> : null}

      {ReactIs.isValidElementType(SubmitButton) ? (
        <SubmitButton
          handleSubmit={() => {
            const actionsError = validateActions(
              intl,
              rules,
              aggregatorAgendaSchema,
              sourceSchema
            );

            if (actionsError) {
              setError(actionsError);

              return;
            }

            return onSubmit(rules.map(rule => _.omit(rule, 'id')));
          }}
          rules={rules}
          onCancel={onCancel}
        />
      ) : null}
    </>
  );
}
