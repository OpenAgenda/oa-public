import _ from 'lodash';
import { useState, useCallback } from 'react';
import * as ReactIs from 'react-is';
import { useIntl } from 'react-intl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MoreInfo } from '@openagenda/react-shared';
import externalLinks from '../../utils/externalLinks.js';
import readClipboard from '../../utils/readClipboard.js';
import messages from './messages.js';
import RuleItem from './RuleItem/index.js';
import validateActions from './validateActions.js';
import WarningBlock from './WarningBlock.js';

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
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const pasteRules = useCallback(async () => {
    addRules(await readClipboard().catch(() => null));
  }, [addRules]);

  const setModeAdd = useCallback(
    (isRequiredFilter) => setMode('add', { isRequiredFilter }),
    [setMode],
  );
  const setModeUpdate = useCallback(
    (id, isRequiredFilter) => setMode('update', { id, isRequiredFilter }),
    [setMode],
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
          aggregatorAgendaSchema={aggregatorAgendaSchema}
          isAggregator={isAggregator}
          intl={intl}
          messages={messages}
        />

        {/* RequiredFilters */}
        <div>
          <h4 style={{ fontWeight: 'bold' }}>
            {intl.formatMessage(messages.filters)}
          </h4>
          <p>{intl.formatMessage(messages.filtersDesc)}</p>
          <div className="margin-v-sm">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={() => {
                setIsDragging(true);
              }}
              onDragEnd={(event) => {
                const { active, over } = event;
                if (active.id !== over.id) {
                  const ruleIds = rules.requiredFilters.map((rule) => rule.id);
                  const oldIndex = ruleIds.indexOf(active.id);
                  const newIndex = ruleIds.indexOf(over.id);
                  reorderRules(oldIndex, newIndex, true);
                }
                setIsDragging(false);
              }}
            >
              <SortableContext
                items={rules.requiredFilters.map((rule) => rule.id)}
                strategy={verticalListSortingStrategy}
              >
                {rules.requiredFilters.map((rule, index) => (
                  <RuleItem
                    key={rule.id}
                    rule={rule}
                    onUpdate={setModeUpdate}
                    onRemove={removeRule}
                    sourceAgenda={sourceAgenda}
                    sourceAgendaSchema={sourceSchema}
                    aggregatorAgenda={aggregatorAgenda}
                    aggregatorAgendaSchema={aggregatorAgendaSchema}
                    index={index}
                    isDragging={isDragging}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        {/* eslint-enable */}

        <div className="padding-v-sm text-center">
          <button
            type="button"
            className="btn btn-bordered btn-primary"
            onClick={() => setModeAdd(true)}
          >
            <i className="fa fa-sm fa-plus" aria-hidden="true" />{' '}
            {intl.formatMessage(messages.addAFilter)}
          </button>
        </div>

        {/* Actions */}
        <div>
          <h4 style={{ fontWeight: 'bold' }}>
            {intl.formatMessage(messages.actions)}
          </h4>
          <p>{intl.formatMessage(messages.actionsDesc)}</p>
          <div className="margin-v-sm">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={() => {
                setIsDragging(true);
              }}
              onDragEnd={(event) => {
                const { active, over } = event;
                if (active.id !== over.id) {
                  const ruleIds = rules.actions.map((rule) => rule.id);
                  const oldIndex = ruleIds.indexOf(active.id);
                  const newIndex = ruleIds.indexOf(over.id);
                  reorderRules(oldIndex, newIndex, false);
                }
                setIsDragging(false);
              }}
            >
              <SortableContext
                items={rules.actions.map((rule) => rule.id)}
                strategy={verticalListSortingStrategy}
              >
                {rules.actions.map((rule, index) => (
                  <RuleItem
                    key={rule.id}
                    rule={rule}
                    onUpdate={setModeUpdate}
                    onRemove={removeRule}
                    sourceAgenda={sourceAgenda}
                    sourceAgendaSchema={sourceSchema}
                    aggregatorAgenda={aggregatorAgenda}
                    aggregatorAgendaSchema={aggregatorAgendaSchema}
                    index={index}
                    isDragging={isDragging}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        {/* eslint-enable */}

        <div className="padding-v-sm text-center">
          <button
            type="button"
            className="btn btn-bordered btn-primary"
            onClick={() => setModeAdd(false)}
          >
            <i className="fa fa-sm fa-plus" aria-hidden="true" />{' '}
            {intl.formatMessage(messages.addAnAction)}
          </button>
        </div>
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
              link={externalLinks.helpCopyPaste}
            />
          </div>
        ) : null}
      </div>

      {error ? <div className="text-danger">{error}</div> : null}

      {ReactIs.isValidElementType(SubmitButton) ? (
        <SubmitButton
          handleSubmit={() => {
            const actionsError = validateActions(
              intl,
              [].concat(rules.requiredFilters, rules.actions),
              aggregatorAgendaSchema,
              sourceSchema,
            );

            if (actionsError) {
              setError(actionsError);

              return;
            }

            return onSubmit(
              []
                .concat(rules.requiredFilters, rules.actions)
                .map((rule) => _.omit(rule, 'id')),
            );
          }}
          rules={rules}
          onCancel={onCancel}
        />
      ) : null}
    </>
  );
}
