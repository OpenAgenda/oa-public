import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

const log = debug('Stepper');

const messages = defineMessages({
  duplicatesSelection: {
    id: 'AgendaLocations.stepper.duplicatesSelection',
    defaultMessage: 'Duplicates Selection',
  },
  targetChoice: {
    id: 'AgendaLocations.stepper.targetChoice',
    defaultMessage: 'Target location choice',
  },
  confirmation: {
    id: 'AgendaLocations.stepper.confirmation',
    defaultMessage: 'Confirmation',
  },
  launchMerge: {
    id: 'AgendaLocations.stepper.launchMerge',
    defaultMessage: 'Launch merge',
  },
  next: {
    id: 'AgendaLocations.stepper.next',
    defaultMessage: 'Next: ',
  },
  infoSelection: {
    id: 'AgendaLocations.stepper.infoSelection',
    defaultMessage: 'Select locations you want to merge ',
  },
  infoSelectionFromDP: {
    id: 'AgendaLocations.stepper.infoSelectionFromDP',
    defaultMessage: 'Check the selection and deselect those who are not duplicates',
  },
  Selection: {
    id: 'AgendaLocations.stepper.Selection',
    defaultMessage: '{count, plural, =0 {no location selected} one {1 location selected} other {# locations selected}}',
  },
  infoRefSelection: {
    id: 'AgendaLocations.stepper.infoRefSelection',
    defaultMessage: 'Select target from your selection, it will be kept after the merge',
  },
  infoConfirmation: {
    id: 'AgendaLocations.stepper.infoConfirmation',
    defaultMessage: 'Merged locations will be deleted and there linked events will be link to the target location',
  },
  see: {
    id: 'AgendaLocations.stepper.see',
    defaultMessage: 'see',
  },
  backToSelection: {
    id: 'AgendaLocations.stepper.backToSelection',
    defaultMessage: 'go back to selection',
  },
  backToTargetSelection: {
    id: 'AgendaLocations.stepper.backToTargetSelection',
    defaultMessage: 'go back to target selection',
  },
  seeDetails: {
    id: 'AgendaLocations.stepper.seeDetails',
    defaultMessage: 'Details',
  },
  notDuplicates: {
    id: 'AgendaLocations.stepper.notDuplicates',
    defaultMessage: 'Those are not Duplicates',
  },
  cancelMerge: {
    id: 'AgendaLocations.stepper.cancelMerge',
    defaultMessage: 'Cancel Merge',
  },
  locationsMerge: {
    id: 'AgendaLocations.stepper.locationsMerge',
    defaultMessage: 'Locations Merge',
  }
});

class Stepper extends Component {
  static propTypes = {
    merge: PropTypes.object.isRequired,
    seeSelection: PropTypes.func.isRequired,
    goToMergeStep2: PropTypes.func.isRequired,
    goToMergeStep3: PropTypes.func.isRequired,
    backToMergeStep1: PropTypes.func.isRequired,
    backToMergeStep2: PropTypes.func.isRequired,
    seeDetails: PropTypes.func.isRequired,
    launchMerge: PropTypes.func.isRequired,
    closeMerge: PropTypes.func.isRequired,
    disqualifyDuplicates: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.updateStep = this.updateStep.bind(this);
  }

  updateStep() {
    const { merge } = this.props;
    const { step } = merge;
    const {
      goToMergeStep2, seeSelection, launchMerge
    } = this.props;
    if (step === 1 && merge.locationUids.length >= 2) {
      seeSelection();
      setTimeout(() => { goToMergeStep2(); }, 600);
    }
    if (step === 3) launchMerge();
  }

  StepInfo() {
    const {
      seeSelection,
      backToMergeStep1,
      backToMergeStep2,
      seeDetails,
      merge
    } = this.props;
    const { step } = merge;
    if (step === 1 && merge.entryPoint) {
      return (
        <div> <FormattedMessage {...messages.infoSelectionFromDP} /> <br />
          <FormattedMessage values={{ count: merge.locationUids.length }} {...messages.Selection} />
          <button
            type="button"
            className={merge.locationUids.length ? 'btn btn-link' : 'btn btn-link disabled'}
            onClick={seeSelection}
          >
            <FormattedMessage {...messages.see} />
          </button>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div> <FormattedMessage {...messages.infoSelection} /> <br />
          <FormattedMessage values={{ count: merge.locationUids.length }} {...messages.Selection} />
          <button
            type="button"
            className={merge.locationUids.length ? 'btn btn-link' : 'btn btn-link disabled'}
            onClick={seeSelection}
          >
            <FormattedMessage {...messages.see} />
          </button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div> <FormattedMessage {...messages.infoRefSelection} /> <br />
          <FormattedMessage values={{ count: merge.locationUids.length }} {...messages.Selection} />
          <button
            type="button"
            className={merge.locationUids.length ? 'btn btn-link' : 'btn btn-link disabled'}
            onClick={() => {
              backToMergeStep1();
            }}
          >
            <FormattedMessage {...messages.backToSelection} />
          </button>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div> <FormattedMessage {...messages.infoConfirmation} /> <br />
          {merge.target.name}
          <button
            type="button"
            className="btn btn-link  action"
            onClick={() => seeDetails(merge.target)}
          >
            <FormattedMessage {...messages.seeDetails} />
          </button>
          <br />
          <FormattedMessage values={{ count: merge.locationUids.length }} {...messages.Selection} />
          <button
            type="button"
            className={merge.locationUids.length ? 'btn btn-link' : 'btn btn-link disabled'}
            onClick={() => {
              backToMergeStep2();
            }}
          >
            <FormattedMessage {...messages.backToTargetSelection} />
          </button>
        </div>
      );
    }
  }

  render() {
    const { merge, closeMerge, disqualifyDuplicates } = this.props;
    const { step } = merge;
    let step2Class = 'step';
    if (step === 2) step2Class = 'step active';
    if (step === 3) step2Class = 'step passed';
    log(step);
    return (
      <div className="info-block margin-bottom-md">
        <h1 className="text-center margin-bottom-sm"><FormattedMessage {...messages.locationsMerge} /></h1>
        <div className="stepper-container margin-bottom-md">
          <div className="stepper gray-bg-lightest">
            <div className={step === 1 ? 'step active ' : 'step passed'}><FormattedMessage {...messages.duplicatesSelection} /></div>
            <div className={step2Class}><FormattedMessage {...messages.targetChoice} /></div>
            <div className={step === 3 ? 'step active ' : 'step'}><FormattedMessage {...messages.confirmation} /></div>
          </div>
        </div>
        <div className="text-center margin-top-sm">
          {this.StepInfo()}
        </div>
        <div className="text-center margin-top-sm">
          <button
            type="button"
            className="btn btn-danger margin-right-sm"
            onClick={() => closeMerge()}
          >
            <FormattedMessage {...messages.cancelMerge} />
          </button>
          {step === 1 && merge.entryPoint ? (
            <button
              type="button"
              className="btn btn-danger margin-right-sm"
              onClick={() => disqualifyDuplicates()}
            >
              <FormattedMessage {...messages.notDuplicates} />
            </button>
          ) : null}
          {!(step === 2) ? (
            <button
              type="button"
              className={step === 1 && merge.locationUids.length < 2 ? 'btn btn-primary disabled' : 'btn btn-primary'}
              onClick={this.updateStep}
            >
              {step !== 3 ? <FormattedMessage {...messages.next} /> : null}
              {step === 1 ? <FormattedMessage {...messages.targetChoice} /> : null}
              {step === 3 ? <FormattedMessage {...messages.launchMerge} /> : null}
            </button>
          ) : null}
        </div>

      </div>
    );
  }
}

export default injectIntl(Stepper);
