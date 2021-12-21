import React, { useCallback, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import {
  useMemoOne,
  useApiClient,
  Modal,
  Image,
  Spinner,
} from '@openagenda/react-shared';
import Stepper from './Stepper';
import AgendasSearch from './AgendasSearch';
import SlugSearch from './SlugSearch';
import DefineRules from './DefineRules';
import EvaluateOptions from './EvaluateOptions';

const DEFAULT_IMAGE = 'https://s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png';

const messages = defineMessages({
  modalTitle: {
    id: 'aggregator-sources.AddSourceModal.modalTitle',
    defaultMessage:
      'Add a source{agenda, select, undefined {} other {: {agenda}}}',
  },
  removeConfirmMessage: {
    id: 'aggregator-sources.AddSourceModal.removeConfirmMessage',
    defaultMessage:
      'Are you sure you want to delete this agenda from sources ?',
  },
  official: {
    id: 'aggregator-sources.AddSourceModal.official',
    defaultMessage: 'Official',
  },
  private: {
    id: 'aggregator-sources.AddSourceModal.private',
    defaultMessage: 'Private',
  },
  alreadyInSources: {
    id: 'aggregator-sources.AddSourceModal.alreadyInSources',
    defaultMessage: 'Already in sources',
  },
  selectAgenda: {
    id: 'aggregator-sources.AddSourceModal.selectAgenda',
    defaultMessage: 'Select an agenda',
  },
  selectThisAgenda: {
    id: 'aggregator-sources.AddSourceModal.selectThisAgenda',
    defaultMessage: 'Select this agenda',
  },
  defineRules: {
    id: 'aggregator-sources.AddSourceModal.defineRules',
    defaultMessage: 'Define rules',
  },
  or: {
    id: 'aggregator-sources.AddSourceModal.or',
    defaultMessage: 'or',
  },
  enterALink: {
    id: 'aggregator-sources.AddSourceModal.enterALink',
    defaultMessage: 'Enter an agenda link',
  },
  makeASearch: {
    id: 'aggregator-sources.AddSourceModal.makeASearch',
    defaultMessage: 'Make a search',
  },
  showAgendaAction: {
    id: 'aggregator-sources.AddSourceModal.showAgendaAction',
    defaultMessage: 'Show agenda',
  },
  searchAgenda: {
    id: 'aggregator-sources.AddSourceModal.searchAgenda',
    defaultMessage: 'Search an agenda',
  },
  selectStep: {
    id: 'aggregator-sources.AddSourceModal.selectStep',
    defaultMessage: 'Agenda',
  },
  defineRulesStep: {
    id: 'aggregator-sources.AddSourceModal.defineRulesStep',
    defaultMessage: 'Rules',
  },
  evaluationStep: {
    id: 'aggregator-sources.AddSourceModal.evaluationStep',
    defaultMessage: 'Evaluation',
  },
  evaluateMessage: {
    id: 'aggregator-sources.AddSourceModal.evaluateMessage',
    defaultMessage:
      'The agenda {source} is about to be added to the sources of {aggregator} {ruleCount, plural, =0 {without rules} one {with 1 rule} other {with {ruleCount} rules}}.',
  },
  noAgendas: {
    id: 'aggregator-sources.AddSourceModal.noAgendas',
    defaultMessage: 'No result',
  },
  chooseAnotherSource: {
    id: 'aggregator-sources.AddSourceModal.chooseAnotherSource',
    defaultMessage: 'Choose another source',
  },
  infoMessageImmediat: {
    id: 'aggregator-sources.AddSourceModal.InfoMessageImmediat',
    defaultMessage:
      'The calendar has been added to your sources. The next events which will be published there and which correspond to the rules that you have defined will go up in your calendar.',
  },
  infoMessage: {
    id: 'aggregator-sources.AddSourceModal.InfoMessage',
    defaultMessage:
      'The calendar has been added to your sources. The events are being evaluated, those which correspond to the rules that you have defined will go up in your calendar in a few minutes.',
  },
  ok: {
    id: 'aggregator-sources.AddSourceModal.ok',
    defaultMessage: 'OK',
  },
  submitButton: {
    id: 'aggregator-sources.AddSourceModal.submitButton',
    defaultMessage: 'Add source',
  },
});

const modalClassnames = {
  overlay: 'popup-overlay big',
};

function AgendaItem({
  agenda, sources, onSelect, firstAction
}) {
  const intl = useIntl();
  const onAgendaClick = useCallback(() => onSelect(agenda), [onSelect, agenda]);
  const alreadyInSources = useMemo(
    () => sources.some(source => source.agenda.uid === agenda.uid),
    [sources, agenda]
  );
  const agendaImage = useMemo(() => agenda?.image ?? DEFAULT_IMAGE, [agenda]);

  if (alreadyInSources) {
    return (
      <div className="padding-v-sm">
        <div className="agenda-item media text-muted" key={agenda.uid}>
          <div className="media-left">
            <Image
              src={agendaImage}
              fallbackSrc={agendaImage.replace('cibuldev', 'cibul')}
              className="media-object ill avatar"
              alt={agenda.title}
            />
          </div>
          <div className="media-body">
            <div className="title media-heading">
              <strong>{agenda.title}</strong>

              {!!agenda.official && (
                <span className="official">
                  <i />
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-inner">
                      {intl.formatMessage(messages.official)}
                    </div>
                  </div>
                </span>
              )}

              {!!agenda.private && (
                <div className="tooltip-icon">
                  <i className="fa fa-unlock-alt" />
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-inner">
                      {intl.formatMessage(messages.private)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <em>{intl.formatMessage(messages.alreadyInSources)}</em>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="padding-v-sm">
      <div className="agenda-item media" key={agenda.uid}>
        <div className="media-left">
          <button
            type="button"
            className="btn btn-link-inline"
            onClick={onAgendaClick}
          >
            <Image
              src={agendaImage}
              fallbackSrc={agendaImage.replace('cibuldev', 'cibul')}
              className="media-object ill avatar"
              alt={agenda.title}
            />
          </button>
        </div>
        <div className="media-body">
          <div className="title media-heading">
            <button
              type="button"
              className="btn btn-link-inline"
              onClick={onAgendaClick}
            >
              <strong>{agenda.title}</strong>

              {!!agenda.official && (
                <span className="official">
                  <i />
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-inner">
                      {intl.formatMessage(messages.official)}
                    </div>
                  </div>
                </span>
              )}
            </button>

            {!!agenda.private && (
              <div className="tooltip-icon">
                <i className="fa fa-unlock-alt" />
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow" />
                  <div className="tooltip-inner">
                    {intl.formatMessage(messages.private)}
                  </div>
                </div>
              </div>
            )}
          </div>
          {firstAction}
          &ensp;
          <a href={`/${agenda.slug}`} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(messages.showAgendaAction)}{' '}
            <i className="fa fa-sm fa-external-link" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AddSourceModal({
  aggregator,
  aggregatorAgenda,
  aggregatorAgendaSchema,
  preselectedAgenda,
  onSubmit,
  onClose,
}) {
  const intl = useIntl();
  const apiClient = useApiClient();

  const [selectType, setSelectType] = useState('search'); // search || slug
  const [selectedStep, setSelectedStep] = useState(
    preselectedAgenda ? 'defineRules' : 'selectAgenda'
  );
  const [selectedEvaluate, setSelectedEvaluate] = useState();
  const [selectedAgenda, setSelectedAgenda] = useState(preselectedAgenda);
  const [rules, setRules] = useState();

  const toggleSelectType = useCallback(
    e => {
      if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        return;
      }

      setSelectType(selectType === 'search' ? 'slug' : 'search');
    },
    [selectType, setSelectType]
  );

  const sources = useSelector(state => state.sources.data);
  const agendaRes = useSelector(state => state.res.agendaSearch);
  const slugRes = useSelector(state => state.res.getAgenda);

  const isActive = useCallback((step, index, steps, selectedKey) => {
    const selectedStepIndex = steps.findIndex(s => s.key === selectedKey);

    return index === selectedStepIndex;
  }, []);
  const isActivable = useCallback(
    (step, index, steps, selectedKey) => {
      const selectedStepIndex = steps.findIndex(s => s.key === selectedKey);

      if (step.key === 'defineRules' && selectedAgenda) {
        return true;
      }

      return index < selectedStepIndex;
    },
    [selectedAgenda]
  );
  const isPassed = useCallback((step, index, steps, selectedKey) => {
    const selectedStepIndex = steps.findIndex(s => s.key === selectedKey);

    return index < selectedStepIndex;
  }, []);

  const onSelectAgenda = useCallback(
    async sourceAgenda => {
      sourceAgenda.schema = await apiClient.get(
        `/${sourceAgenda.slug}/settings/schema`
      );

      setSelectedAgenda(sourceAgenda);
      setSelectedStep('defineRules');
    },
    [apiClient]
  );

  const selectStep = useCallback(
    key => {
      if (key === 'selectAgenda') {
        // setSelectedAgenda(null);
        // setRules(null);
        setSelectType('search');
      }

      setSelectedStep(key);
    },
    [setSelectType, setSelectedStep]
  );

  const steps = useMemoOne(
    () => [
      {
        key: 'selectAgenda',
        label: intl.formatMessage(messages.selectStep),
        display: true,
        active: isActive,
        activable: isActivable,
        passed: isPassed,
      },
      {
        key: 'defineRules',
        label: intl.formatMessage(messages.defineRulesStep),
        display: true,
        active: isActive,
        activable: isActivable,
        passed: isPassed,
      },
      {
        key: 'evaluation',
        label: intl.formatMessage(messages.evaluationStep),
        display: true,
        active: isActive,
        activable: isActivable,
        passed: isPassed,
      },
      {
        key: 'info',
        label: null,
        display: true,
        active: isActive,
        activable: isActivable,
        passed: isPassed,
        confirmation: true,
      },
    ],
    [intl, isActivable, isActive, isPassed]
  );

  const handleRulesSubmit = useCallback(
    value => {
      setRules(value);
      selectStep('evaluation');
    },
    [setRules, selectStep]
  );

  const handleFinalSubmit = useCallback(
    ({ evaluate }) => {
      onSubmit(selectedAgenda, rules, evaluate).then(() => {
        setSelectedEvaluate(evaluate);
        selectStep('info');
      });
    },
    [onSubmit, selectedAgenda, rules, selectStep, setSelectedEvaluate]
  );

  const fieldProps = useMemo(
    () => ({
      placeholder: intl.formatMessage(messages.searchAgenda),
      classNameGroup: 'form-group search margin-top-md margin-bottom-sm',
      className: 'form-control',
      autoComplete: 'off',
      autoFocus: true,
      intl,
    }),
    [intl]
  );

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle, {
        agenda: selectedAgenda?.title,
      })}
      onClose={onClose}
      classNames={modalClassnames}
    >
      <div>
        <Stepper
          steps={steps}
          onSelect={selectStep}
          additionals={[selectedStep]}
        />

        {selectedStep === 'selectAgenda' && selectedAgenda ? (
          <AgendaItem
            agenda={selectedAgenda}
            sources={sources}
            onSelect={onSelectAgenda}
            firstAction={(
              <button
                type="button"
                className="btn btn-link-inline"
                onClick={() => setSelectedAgenda()}
              >
                {intl.formatMessage(messages.chooseAnotherSource)}
              </button>
            )}
          />
        ) : null}

        {selectedStep === 'selectAgenda'
        && !selectedAgenda
        && selectType === 'search' ? (
          <AgendasSearch
            res={agendaRes}
            fieldProps={fieldProps}
            render={({ state, form, nextPage }) => (
              <>
                {form}

                <p>
                  {intl.formatMessage(messages.or)}{' '}
                  <button
                    type="button"
                    className="btn btn-link-inline"
                    tabIndex={0}
                    onClick={toggleSelectType}
                    onKeyPress={toggleSelectType}
                  >
                    {intl.formatMessage(messages.enterALink)}
                  </button>
                </p>

                {state.agendas.length
                  ? state.agendas.map(sourceAgenda => {
                    if (sourceAgenda.uid === aggregatorAgenda.uid) {
                      return null;
                    }

                    return (
                      <AgendaItem
                        key={sourceAgenda.uid}
                        sources={sources}
                        agenda={sourceAgenda}
                        onSelect={onSelectAgenda}
                        firstAction={(
                          <button
                            type="button"
                            className="btn btn-link-inline"
                            onClick={() => onSelectAgenda(sourceAgenda)}
                          >
                            {intl.formatMessage(messages.selectThisAgenda)}
                          </button>
                          )}
                      />
                    );
                  })
                  : null}

                {!state.agendas.length && state.firstLoading === false ? (
                  <div className="padding-v-sm text-center">
                    {intl.formatMessage(messages.noAgendas)}
                  </div>
                ) : null}

                {state.nextLoading || state.firstLoading ? (
                  <div
                    className="padding-v-md"
                    style={{ position: 'relative' }}
                  >
                    <Spinner />
                  </div>
                ) : null}

                <Waypoint onEnter={nextPage} />
              </>
            )}
          />
          ) : null}

        {selectedStep === 'selectAgenda'
        && !selectedAgenda
        && selectType !== 'search' ? (
          <SlugSearch
            res={slugRes}
            render={({ state, form }) => (
              <>
                {form}

                <p>
                  {intl.formatMessage(messages.or)}{' '}
                  <button
                    type="button"
                    className="btn btn-link-inline"
                    tabIndex={0}
                    onClick={toggleSelectType}
                    onKeyPress={toggleSelectType}
                  >
                    {intl.formatMessage(messages.makeASearch)}
                  </button>
                </p>

                <div>
                  {state.agenda && state.agenda.uid !== aggregatorAgenda.uid ? (
                    <AgendaItem
                      key={state.agenda.uid}
                      sources={sources}
                      agenda={state.agenda}
                      onSelect={onSelectAgenda}
                      firstAction={(
                        <button
                          type="button"
                          className="btn btn-link-inline"
                          onClick={() => onSelectAgenda(state.agenda)}
                        >
                          {intl.formatMessage(messages.selectThisAgenda)}
                        </button>
                      )}
                    />
                  ) : null}
                </div>
              </>
            )}
          />
          ) : null}

        {selectedStep === 'defineRules' ? (
          <DefineRules
            displayInfo
            aggregator={aggregator}
            aggregatorAgenda={aggregatorAgenda}
            aggregatorAgendaSchema={aggregatorAgendaSchema}
            sourceSchema={selectedAgenda?.schema}
            sourceAgenda={selectedAgenda}
            primaryAction="next"
            initialRules={rules}
            onSubmit={handleRulesSubmit}
            onCancel={onClose}
          />
        ) : null}

        {selectedStep === 'evaluation' ? (
          <EvaluateOptions
            handleFinalSubmit={handleFinalSubmit}
            onClose={onClose}
            message={intl.formatMessage(messages.evaluateMessage, {
              aggregator: <b>{aggregatorAgenda.title}</b>,
              source: <b>{selectedAgenda.title}</b>,
              ruleCount: rules.length,
            })}
            submitMessage={intl.formatMessage(messages.submitButton)}
          />
        ) : null}

        {selectedStep === 'info' ? (
          <div>
            <div>
              {selectedEvaluate.evaluate === 'all'
                ? intl.formatMessage(messages.infoMessageImmediat)
                : intl.formatMessage(messages.infoMessage)}
            </div>
            <div className="text-center padding-top-sm">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                {intl.formatMessage(messages.ok)}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
