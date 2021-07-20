import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import { MoreInfo } from '@openagenda/react-components';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

const log = debug('MergeMenu');

const messages = defineMessages({
  seeMergeList: {
    id: 'AgendaLocations.MergeMenu.seeMergeList',
    defaultMessage: 'See',
  },
  refLocation: {
    id: 'AgendaLocations.MergeMenu.refLocation',
    defaultMessage: 'Reference location: ',
  },
  retaineRefLocation: { // was ref location2
    id: 'AgendaLocations.MergeMenu.retaineRefLocation',
    defaultMessage: 'This location will be retained at the end of the merge',
  },
  refLocationInfo: {
    id: 'AgendaLocations.MergeMenu.refLocationInfo',
    defaultMessage: 'choose a location that will be retained at the end of the merge',
  },
  unselect: {
    id: 'AgendaLocations.MergeMenu.unselect',
    defaultMessage: 'Unselect',
  },
  cancel: {
    id: 'AgendaLocations.MergeMenu.cancel',
    defaultMessage: 'Cancel',
  },
  mergeSelection: {
    id: 'AgendaLocations.MergeMenu.mergeSelection',
    defaultMessage: '{count, plural, =0 {You haven`t selected any location to merge} one {You currently selected one location.} other {You currently selected # locations.}}',
  },
  seeSelection: {
    id: 'AgendaLocations.MergeMenu.seeSelection',
    defaultMessage: 'View selection',
  },
  launchMerge: {
    id: 'AgendaLocations.MergeMenu.launchMerge',
    defaultMessage: 'Launch merge',
  },
  mergeDescription: {
    id: 'AgendaLocations.MergeMenu.mergeDescription',
    defaultMessage: 'Locations merge',
  },
});

class MergeMenu extends Component {
  static propTypes = {
    merge: PropTypes.object.isRequired,
    locations: PropTypes.array.isRequired,
    closeMerge: PropTypes.func.isRequired,
    launchMerge: PropTypes.func.isRequired,
    unselectRef: PropTypes.func.isRequired,
    seeRef: PropTypes.func.isRequired,
    seeSelection: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  renderRefInfo() {
    const {
      merge,
      locations,
      unselectRef,
      seeRef,
      intl
    } = this.props;
    if (merge.targetUid) {
      return (
        <div className="btn-link-group">
          <span><FormattedMessage {...messages.refLocation} /></span>
          <strong>{locations.find(l => l.uid === merge.targetUid).name}</strong>
          <button
            type="button"
            onClick={seeRef}
            className="btn btn-link"
          >
            <FormattedMessage {...messages.seeMergeList} />
          </button>
          <button
            type="button"
            onClick={unselectRef}
            className="btn btn-link text-danger padding-h-xs"
          >
            <FormattedMessage {...messages.unselect} />
          </button>
          <MoreInfo
            className="margin-left-sm"
            id="target-help"
            content={intl.formatMessage(messages.retaineRefLocation)}
            placement="top"
          />
        </div>
      );
    }
    return (
      <div className="btn-link-group">
        <FormattedMessage {...messages.refLocation} />
        <FormattedMessage {...messages.refLocationInfo} />
      </div>
    );
  }

  render() {
    const {
      merge,
      closeMerge,
      launchMerge,
      seeSelection,
    } = this.props;
    return (
      <div className="merge-menu row margin-bottom-md">
        <div className="col-sm-12">
          <div className="btn-link-group">
            <strong><FormattedMessage {...messages.mergeDescription} /></strong>
            <button
              type="button"
              onClick={closeMerge}
              className="btn btn-link text-danger"
            >
              <FormattedMessage {...messages.cancel} />
            </button>
          </div>
          {this.renderRefInfo()}
          <span>
            <FormattedMessage values={{ count: merge.locationUids.length }} {...messages.mergeSelection} />
          </span>
          <div>
            <button
              type="button"
              className={merge.locationUids.length ? 'btn btn-link padding-left-z padding-right-xs' : 'btn btn-link disabled padding-left-z padding-right-xs'}
              onClick={seeSelection}
            >
              <FormattedMessage {...messages.seeSelection} />
            </button>
          </div>
          <button
            type="button"
            className={merge.locationUids.length && merge.targetUid ? 'btn btn-primary margin-top-xs' : 'btn btn-primary disabled margin-top-xs'}
            onClick={launchMerge}
          >
            <FormattedMessage {...messages.launchMerge} />
          </button>
        </div>
      </div>
    );
  }
}

export default injectIntl(MergeMenu);
