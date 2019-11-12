import React, {
  useCallback, useMemo, useReducer, useState
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { Form, Field } from 'react-final-form';
import Modal from '@openagenda/react-components/build/Modal';
import Image from '@openagenda/react-components/build/Image';
import Spinner from '@openagenda/react-components/build/Spinner';
import Stepper from './Stepper';
import AgendasSearch from './AgendasSearch';
import SlugSearch from './SlugSearch';
import DefineRules from './DefineRules';

const messages = defineMessages({
  modalTitle: {
    id: 'aggregator-sources.AddSourceModal.modalTitle',
    defaultMessage:
      'Add a source{agenda, select, undefined {} other {: {agenda}}}'
  },
  nextButton: {
    id: 'aggregator-sources.AddSourceModal.nextButton',
    defaultMessage: 'Next'
  },
  submitButton: {
    id: 'aggregator-sources.AddSourceModal.submitButton',
    defaultMessage: 'Add source'
  },
  removeConfirmMessage: {
    id: 'aggregator-sources.AddSourceModal.removeConfirmMessage',
    defaultMessage: 'Are you sure you want to delete this agenda from sources ?'
  },
  official: {
    id: 'aggregator-sources.AddSourceModal.official',
    defaultMessage: 'Official'
  },
  private: {
    id: 'aggregator-sources.AddSourceModal.private',
    defaultMessage: 'Private'
  },
  alreadyInSources: {
    id: 'aggregator-sources.AddSourceModal.alreadyInSources',
    defaultMessage: 'Already in sources'
  },
  selectAgenda: {
    id: 'aggregator-sources.AddSourceModal.selectAgenda',
    defaultMessage: 'Select an agenda'
  },
  selectThisAgenda: {
    id: 'aggregator-sources.AddSourceModal.selectThisAgenda',
    defaultMessage: 'Select this agenda'
  },
  defineRules: {
    id: 'aggregator-sources.AddSourceModal.defineRules',
    defaultMessage: 'Define rules'
  },
  or: {
    id: 'aggregator-sources.AddSourceModal.or',
    defaultMessage: 'or'
  },
  enterALink: {
    id: 'aggregator-sources.AddSourceModal.enterALink',
    defaultMessage: 'Enter an agenda link'
  },
  makeASearch: {
    id: 'aggregator-sources.AddSourceModal.makeASearch',
    defaultMessage: 'Make a search'
  },
  showAgendaAction: {
    id: 'aggregator-sources.AddSourceModal.showAgendaAction',
    defaultMessage: 'Show agenda'
  },
  searchAgenda: {
    id: 'aggregator-sources.AddSourceModal.searchAgenda',
    defaultMessage: 'Search an agenda'
  },
  selectStep: {
    id: 'aggregator-sources.AddSourceModal.selectStep',
    defaultMessage: 'Agenda'
  },
  defineRulesStep: {
    id: 'aggregator-sources.AddSourceModal.defineRulesStep',
    defaultMessage: 'Filters'
  },
  confirmationStep: {
    id: 'aggregator-sources.AddSourceModal.confirmationStep',
    defaultMessage: 'Confirmation'
  },
  evaluateMessage: {
    id: 'aggregator-sources.AddSourceModal.evaluateMessage',
    defaultMessage:
      'The agenda {source} is about to be added to the sources of {aggregator} {filterCount, plural, =0 {without filters} one {with 1 filter} other {with {filterCount} filters}}.'
  },
  evaluateOption0: {
    id: 'aggregator-sources.AddSourceModal.evaluateOption0',
    defaultMessage: 'Aggregate only upcoming events'
  },
  evaluateOption1: {
    id: 'aggregator-sources.AddSourceModal.evaluateOption1',
    defaultMessage: 'Aggregate all events'
  },
  cancel: {
    id: 'aggregator-sources.AddSourceModal.cancel',
    defaultMessage: 'Cancel'
  }
});

function stepsReducer(state, action) {
  switch (action.type) {
    case 'selectStep': {
      const selectedStep = state.steps.findIndex(
        step => step.key === action.key
      );

      return {
        steps: state.steps.map((step, i) => ({
          ...step,
          active: i === selectedStep,
          activable: i < selectedStep,
          passed: i < selectedStep
        })),
        selected: action.key
      };
    }
    case 'nextStep': {
      const actualStep = state.steps.findIndex(step => step.active);

      return {
        steps: state.steps.map((step, i) => ({
          ...step,
          active: i === actualStep + 1,
          activable: i <= actualStep,
          passed: i <= actualStep
        })),
        selected: state.steps[actualStep + 1].key
      };
    }
    default:
      return state;
  }
}

const Radio = ({ id, input, children }) => (
  <label htmlFor={id}>
    <input type="radio" id={id} {...input} />
    {children}
  </label>
);

function AgendaItem({ agenda, sources, onSelect }) {
  const intl = useIntl();
  const onAgendaClick = useCallback(() => onSelect(agenda), [onSelect, agenda]);
  const alreadyInSources = useMemo(
    () => sources.some(source => source.agenda.uid === agenda.uid),
    [sources, agenda]
  );

  if (alreadyInSources) {
    return (
      <div className="agenda-item media text-muted" key={agenda.uid}>
        <div className="media-left">
          <Image
            src={agenda.image}
            fallbackSrc={agenda.image.replace('cibuldev', 'cibul')}
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
    );
  }

  return (
    <div className="agenda-item media" key={agenda.uid}>
      <div className="media-left">
        <button
          type="button"
          className="btn btn-link-inline"
          onClick={onAgendaClick}
        >
          <Image
            src={agenda.image}
            fallbackSrc={agenda.image.replace('cibuldev', 'cibul')}
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

        <a href={`/${agenda.slug}`} target="_blank" rel="noopener noreferrer">
          {intl.formatMessage(messages.showAgendaAction)}{' '}
          <i className="fa fa-sm fa-external-link" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function RulesSubmitButton({ handleSubmit, onCancel }) {
  const intl = useIntl();

  return (
    <>
      <div className="pull-left">
        <button
          type="button"
          className="btn btn-link text-danger cancel-button-left"
          onClick={onCancel}
        >
          {intl.formatMessage(messages.cancel)}
        </button>
      </div>
      <div className="text-right">
        <button
          onClick={handleSubmit}
          type="button"
          className="btn btn-primary"
        >
          {intl.formatMessage(messages.nextButton)}
        </button>
      </div>
    </>
  );
}

export default function AddSourceModal({ aggregator, onSubmit, onClose }) {
  const intl = useIntl();

  const [selectType, setSelectType] = useState('search'); // search || slug
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

  const initialStepsState = useMemo(
    () => ({
      steps: [
        {
          key: 'selectAgenda',
          label: intl.formatMessage(messages.selectStep),
          display: true,
          active: true
        },
        {
          key: 'defineRules',
          label: intl.formatMessage(messages.defineRulesStep),
          display: true
        },
        {
          key: 'confirmation',
          label: intl.formatMessage(messages.confirmationStep),
          display: true
        }
      ],
      selected: 'selectAgenda'
    }),
    [intl]
  );
  const [stepsState, stepsDispatch] = useReducer(
    stepsReducer,
    initialStepsState
  );

  const [selectedAgenda, setSelectedAgenda] = useState();
  const [rules, setRules] = useState();
  const onSelectAgenda = useCallback(
    agenda => {
      setSelectedAgenda(agenda);
      stepsDispatch({ type: 'nextStep' });
    },
    [setSelectedAgenda, stepsDispatch]
  );

  const selectStep = useCallback(
    key => {
      if (key === 'selectAgenda') {
        setSelectedAgenda(null);
        setSelectType('search');
      }

      stepsDispatch({ type: 'selectStep', key });
    },
    [setSelectedAgenda, setSelectType, stepsDispatch]
  );

  const handleRulesSubmit = useCallback(
    value => {
      setRules(value);
      selectStep('confirmation');
    },
    [setRules, selectStep]
  );

  const handleFinalSubmit = useCallback(
    ({ evaluate }) => onSubmit(selectedAgenda, rules, evaluate),
    [onSubmit, selectedAgenda, rules]
  );

  const fieldProps = useMemo(
    () => ({
      placeholder: intl.formatMessage(messages.searchAgenda),
      classNameGroup: 'form-group search margin-top-md margin-bottom-sm',
      className: 'form-control',
      autoComplete: 'off',
      autoFocus: true,
      intl
    }),
    [intl]
  );

  const firstStep = selectType === 'search' ? (
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
              className="btn-link-inline"
              tabIndex={0}
              onClick={toggleSelectType}
              onKeyPress={toggleSelectType}
            >
              {intl.formatMessage(messages.enterALink)}
            </button>
          </p>

          <div>
            {state.agendas.length
              ? state.agendas.map(agenda => (
                <AgendaItem
                  key={agenda.uid}
                  sources={sources}
                  agenda={agenda}
                  onSelect={onSelectAgenda}
                />
              ))
              : null}
          </div>

          {state.nextLoading ? (
            <div className="padding-v-md" style={{ position: 'relative' }}>
              <Spinner />
            </div>
          ) : null}

          <Waypoint onEnter={nextPage} />
        </>
      )}
    />
  ) : (
    <SlugSearch
      res={slugRes}
      render={({ state, form }) => (
        <>
          {form}

          <p>
            {intl.formatMessage(messages.or)}{' '}
            <button
              type="button"
              className="btn-link-inline"
              tabIndex={0}
              onClick={toggleSelectType}
              onKeyPress={toggleSelectType}
            >
              {intl.formatMessage(messages.makeASearch)}
            </button>
          </p>

          <div>
            {state.agenda ? (
              <AgendaItem
                key={state.agenda.uid}
                sources={sources}
                agenda={state.agenda}
                onSelect={onSelectAgenda}
              />
            ) : null}
          </div>
        </>
      )}
    />
  );

  const secondStep = (
    <DefineRules
      SubmitButton={RulesSubmitButton}
      onSubmit={handleRulesSubmit}
      onCancel={onClose}
    />
  );

  const thirdStep = (
    <Form onSubmit={handleFinalSubmit}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className="margin-v-sm">
            <p>
              {intl.formatMessage(messages.evaluateMessage, {
                aggregator: <b>{aggregator.title}</b>,
                source: <b>{selectedAgenda.title}</b>,
                filterCount: rules.length
              })}
            </p>

            <Field
              name="evaluate"
              type="radio"
              value="0"
              component={Radio}
              initialValue="0"
            >
              {' '}
              {intl.formatMessage(messages.evaluateOption0)}
            </Field>

            <br />

            <Field name="evaluate" type="radio" value="1" component={Radio}>
              {' '}
              {intl.formatMessage(messages.evaluateOption1)}
            </Field>
          </div>

          <div className="pull-left">
            <button
              type="button"
              className="btn btn-link text-danger cancel-button-left"
              onClick={onClose}
            >
              {intl.formatMessage(messages.cancel)}
            </button>
          </div>
          <div className="text-right">
            <button type="submit" className="btn btn-primary">
              {intl.formatMessage(messages.submitButton)}
            </button>
          </div>
        </form>
      )}
    </Form>
  );

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle, {
        agenda: selectedAgenda?.title
      })}
      onClose={onClose}
    >
      <div className="margin-top-sm">
        <Stepper steps={stepsState.steps} onSelect={selectStep} />

        {stepsState.selected === 'selectAgenda' ? firstStep : null}
        {stepsState.selected === 'defineRules' ? secondStep : null}
        {stepsState.selected === 'confirmation' ? thirdStep : null}
      </div>
    </Modal>
  );
}
