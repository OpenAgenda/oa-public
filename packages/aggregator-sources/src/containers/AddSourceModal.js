import React, {
  useCallback, useMemo, useReducer, useState
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import Modal from '@openagenda/react-components/build/Modal';
import Image from '@openagenda/react-components/build/Image';
import Spinner from '@openagenda/react-components/build/Spinner';
// import * as sourcesActions from '../reducers/sources';
import Stepper from '../components/Stepper';
import AgendasSearch from './AgendasSearch';
import SlugSearch from './SlugSearch';
import DefineRules from './DefineRules';

const messages = defineMessages({
  addSource: {
    id: 'aggregator-sources.AddSourceModal.addSource',
    defaultMessage: 'Add a source'
  },
  removeConfirmMessage: {
    id: 'aggregator-sources.AddSourceModal.removeConfirmMessage',
    defaultMessage: 'Are you sure you want to delete this agenda from sources ?'
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
  const onAgendaClick = useCallback(() => onSelect(agenda), [onSelect, agenda]);

  return (
    <div className="agenda-item media" key={agenda.uid}>
      <div className="media-left">
        <a href={`/${agenda.slug}`}>
          <Image
            src={agenda.image}
            fallbackSrc={agenda.image.replace('cibuldev', 'cibul')}
            className="media-object ill avatar"
            alt={agenda.title}
          />
        </a>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          <a href={`/${agenda.slug}`}>
            <strong>{agenda.title}</strong>

            {!!agenda.official && (
              <span className="official">
                <i />
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow" />
                  <div className="tooltip-inner">Officiel</div>
                </div>
              </span>
            )}
          </a>

          {!!agenda.private && (
            <div className="tooltip-icon">
              <i className="fa fa-unlock-alt" />
              <div className="tooltip right" role="tooltip">
                <div className="tooltip-arrow" />
                <div className="tooltip-inner">Privé</div>
              </div>
            </div>
          )}
        </div>

        {sources.some(source => source.agenda.uid === agenda.uid) ? (
          <em>Déjà dans les sources</em>
        ) : (
          <button
            type="button"
            className="btn btn-link-inline"
            onClick={onAgendaClick}
          >
            Sélectionner cet agenda
          </button>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ handleSubmit, ruleAdditionMode }) {
  return ruleAdditionMode ? null : (
    <div className="text-center">
      <button onClick={handleSubmit} type="button" className="btn btn-primary">
        Ajouter la source
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
  const slugRes = useSelector(state => state.res.slugSearch);

  const initialStepsState = useMemo(
    () => ({
      steps: [
        {
          key: 'selectAgenda',
          label: 'Sélectionner un agenda',
          display: true,
          active: true
        },
        {
          key: 'defineRules',
          label: 'Définir des règles',
          display: true
        }
      ],
      selected: 'selectAgenda'
    }),
    []
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
              ou{' '}
            <button
              type="button"
              className="btn-link-inline"
              tabIndex={0}
              onClick={toggleSelectType}
              onKeyPress={toggleSelectType}
            >
                saisir un lien
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

          {state.nextLoading && (
          <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner />
          </div>
          )}

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
              ou{' '}
            <button
              type="button"
              className="btn-link-inline"
              tabIndex={0}
              onClick={toggleSelectType}
              onKeyPress={toggleSelectType}
            >
                effectuer une recherche
            </button>
          </p>

          <div>
            {state.agenda ? (
              <AgendaItem
                key={state.agenda.uid}
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
    <Modal title={intl.formatMessage(messages.addSource)} onClose={onClose}>
      <div className="margin-v-sm">
        <Stepper steps={stepsState.steps} onSelect={selectStep} />

        {stepsState.selected === 'selectAgenda' ? firstStep : null}
        {stepsState.selected === 'defineRules' ? secondStep : null}
      </div>
    </Modal>
  );
}
