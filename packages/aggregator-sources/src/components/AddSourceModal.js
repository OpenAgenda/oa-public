import React, {
  useCallback, useMemo, useReducer, useState
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
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
    defaultMessage: 'Add a source'
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

function AgendaItem({ agenda, sources, onSelect }) {
  const intl = useIntl();
  const onAgendaClick = useCallback(() => onSelect(agenda), [onSelect, agenda]);

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

        {sources.some(source => source.agenda.uid === agenda.uid) ? (
          <em>{intl.formatMessage(messages.alreadyInSources)}</em>
        ) : (
          <a href={`/${agenda.slug}`} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(messages.showAgendaAction)}{' '}
            <i className="fa fa-sm fa-external-link" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ handleSubmit }) {
  const intl = useIntl();

  return (
    <div className="text-center">
      <button onClick={handleSubmit} type="button" className="btn btn-primary">
        {intl.formatMessage(messages.submitButton)}
      </button>
    </div>
  );
}

export default function AddSourceModal({ onSubmit, onClose }) {
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
          label: intl.formatMessage(messages.selectAgenda),
          display: true,
          active: true
        },
        {
          key: 'defineRules',
          label: intl.formatMessage(messages.defineRules),
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

  const handleSubmit = useCallback(rules => onSubmit(selectedAgenda, rules), [
    onSubmit,
    selectedAgenda
  ]);

  const firstStep = selectType === 'search' ? (
    <AgendasSearch
      res={agendaRes}
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
    <DefineRules SubmitButton={SubmitButton} onSubmit={handleSubmit} />
  );

  return (
    <Modal title={intl.formatMessage(messages.modalTitle)} onClose={onClose}>
      <div className="margin-v-sm">
        <Stepper steps={stepsState.steps} onSelect={selectStep} />

        {stepsState.selected === 'selectAgenda' ? firstStep : null}
        {stepsState.selected === 'defineRules' ? secondStep : null}
      </div>
    </Modal>
  );
}
