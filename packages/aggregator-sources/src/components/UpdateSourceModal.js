import { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Modal } from '@openagenda/react-shared';
import DefineRules from './DefineRules';
import EvaluateOptions from './EvaluateOptions';

const messages = defineMessages({
  updateASource: {
    id: 'aggregator-sources.UpdateSourceModal.updateASource',
    defaultMessage: 'Aggregation rules',
  },
  updateSource: {
    id: 'aggregator-sources.UpdateSourceModal.updateSource',
    defaultMessage: 'Update',
  },
  cancel: {
    id: 'aggregator-sources.UpdateSourceModal.cancel',
    defaultMessage: 'Cancel',
  },
  infoMessageImmediat: {
    id: 'aggregator-sources.UpdateSourceModal.InfoMessageImmediat',
    defaultMessage: 'The update was successful.',
  },
  infoMessage: {
    id: 'aggregator-sources.UpdateSourceModal.InfoMessage',
    defaultMessage:
      'The update was successful. The events are being evaluated, those which correspond to the rules that you have defined will go up in your calendar in a few minutes.',
  },
  ok: {
    id: 'aggregator-sources.AddSourceModal.ok',
    defaultMessage: 'OK',
  },
  evaluateOptionsMessages: {
    id: 'aggregator-sources.UpdateSourceModal.evaluateOptionsMessages',
    defaultMessage:
      'Would you like events published in the source calendar to be re-evaluated as a result of this update?',
  },
});

const modalClassnames = {
  overlay: 'popup-overlay big',
};

export default function UpdateSourceModal({
  onSubmit,
  onClose,
  aggregator,
  aggregatorAgenda,
  aggregatorAgendaSchema,
}) {
  const intl = useIntl();

  const [rules, setRules] = useState();
  const [selectedEvaluate, setSelectedEvaluate] = useState();
  const [step = 'defineRules', setStep] = useState();

  const data = useSelector(state => state.modals.updateSource) || {
    source: {},
  };

  const handleRulesSubmit = useCallback(
    value => {
      setRules(value);
      setStep('evaluateOptions');
    },
    [setRules, setStep],
  );

  const handleFinalSubmit = useCallback(
    ({ evaluate }) => {
      onSubmit(data.source, rules, evaluate).then(() => {
        setSelectedEvaluate(evaluate);
        setStep('info');
      });
    },
    [onSubmit, rules, setSelectedEvaluate, setStep, data.source],
  );

  return (
    <Modal
      title={`${data.source.agenda.title} | ${intl.formatMessage(
        messages.updateASource,
      )}`}
      onClose={onClose}
      classNames={modalClassnames}
    >
      {step === 'defineRules' ? (
        <DefineRules
          displayInfo={false}
          aggregator={aggregator}
          aggregatorAgenda={aggregatorAgenda}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
          sourceAgenda={data.source.agenda}
          sourceSchema={data.schema}
          initialRules={data.source.rules}
          onSubmit={handleRulesSubmit}
          onCancel={onClose}
        />
      ) : null}
      {step === 'evaluateOptions' ? (
        <EvaluateOptions
          handleFinalSubmit={handleFinalSubmit}
          onClose={onClose}
          message={intl.formatMessage(messages.evaluateOptionsMessages)}
          submitMessage={intl.formatMessage(messages.updateSource)}
        />
      ) : null}
      {step === 'info' && selectedEvaluate ? (
        <div>
          <div>
            {selectedEvaluate === 'null'
              ? intl.formatMessage(messages.infoMessageImmediat)
              : intl.formatMessage(messages.infoMessage)}
          </div>
          <div className="text-center padding-top-sm">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              {intl.formatMessage(messages.ok)}
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
