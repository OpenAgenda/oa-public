import _ from 'lodash';
import React, { useState, useMemo, useCallback } from 'react';
import * as ReactIs from 'react-is';
import { useIntl } from 'react-intl';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useMemoOne, MoreInfo } from '@openagenda/react-shared';
import externalLinks from '../../utils/externalLinks';
import getLocalValue from '../../utils/getLocalValue';
import readClipboard from '../../utils/readClipboard';
import messages from './messages';
import RuleItem from './RuleItem';
import validateActions from './validateActions';
import WarningBlock from './WarningBlock';

export default function List({
  aggregator,
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
  onCancel,
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
      <em key={field.field}>{getLocalValue(field.label, intl.locale)}</em>
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
        {displayInfo ? (
          <div>
            {intl.formatMessage(messages.description, { br: <br key="br" /> })}
          </div>
        ) : null}

        <WarningBlock
          top={!displayInfo}
          aggregator={aggregator}
          aggregatorAgenda={aggregatorAgenda}
          sourceSchema={sourceSchema}
          requiredFields={requiredFields}
          requiredFieldList={requiredFieldList}
          intl={intl}
          messages={messages}
        />

        <div className="margin-v-sm">
          <DragDropContext className="list-group" onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {rules.map((rule, index) => (
                    <Draggable
                      key={rule.id}
                      draggableId={rule.id}
                      index={index}
                    >
                      {(provideInner, { isDragging }) => (
                        <li
                          className={`list-group-item draggable${
                            isDragging ? ' dragged' : ''
                          }`}
                          ref={provideInner.innerRef}
                          {...provideInner.draggableProps}
                          {...provideInner.dragHandleProps}
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
        </div>
        {/* eslint-enable */}

        <div className="padding-v-sm text-center">
          <button
            type="button"
            className="btn btn-bordered btn-primary"
            onClick={setModeAdd}
          >
            <i className="fa fa-sm fa-plus" aria-hidden="true" />{' '}
            {intl.formatMessage(messages.addARule)}
          </button>
          {sourceSchema ? (
            <div className="padding-top-xs">
              {navigator?.clipboard?.readText ? (
                <button
                  type="button"
                  className="btn btn-link-inline"
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
              <MoreInfo
                className="margin-left-xs"
                id="copypast-popup"
                link={externalLinks.helpCopyPaste}
              />
            </div>
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
