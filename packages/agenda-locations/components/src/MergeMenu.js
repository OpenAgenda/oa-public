import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import makeLabelGetter from '@openagenda/labels';
import { MoreInfo } from '@openagenda/react-components';
import labels from '@openagenda/labels/agenda-locations/list';

const log = debug('MergeMenu');
const getLabel = makeLabelGetter(labels);

class MergeMenu extends Component {
  static propTypes = {
    merge: PropTypes.object.isRequired,
    locations: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    closeMerge: PropTypes.func.isRequired,
    launchMerge: PropTypes.func.isRequired,
    unselectRef: PropTypes.func.isRequired,
    seeRef: PropTypes.func.isRequired,
    seeSelection: PropTypes.func.isRequired,

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
      lang
    } = this.props;
    if (merge.targetUid) {
      return (
        <div className="btn-link-group">
          <span>{getLabel('reflocation', lang)}</span>
          <strong>{locations.find(l => l.uid === merge.targetUid).name}</strong>
          <button
            type="button"
            onClick={seeRef}
            className="btn btn-link"
          >
            {getLabel('seemergelist')}
          </button>
          <button
            type="button"
            onClick={unselectRef}
            className="btn btn-link text-danger padding-h-xs"
          >
            {getLabel('unselect', lang)}
          </button>
          <MoreInfo
            className="margin-left-sm"
            id="target-help"
            content={getLabel('reflocationinfo2', lang)}
            placement="top"
          />
        </div>
      );
    }
    return (
      <div className="btn-link-group">
        {getLabel('reflocation', lang)}{getLabel('reflocationinfo', lang)}
      </div>
    );
  }

  render() {
    const {
      merge,
      closeMerge,
      launchMerge,
      seeSelection,
      lang
    } = this.props;
    return (
      <div className="merge-menu row margin-bottom-md">
        <div className="col-sm-12">
          <div className="btn-link-group">
            <strong>{getLabel('mergedescription', lang)}</strong>
            <button
              type="button"
              onClick={closeMerge}
              className="btn btn-link text-danger"
            >
              {getLabel('cancel', lang)}
            </button>
          </div>
          {this.renderRefInfo()}
          {merge.locationUids.length ? (
            <span>
              {getLabel('mergeselection', {
                count: merge.locationUids.length,
              }, lang)}
            </span>
          ) : (
            <span>{getLabel('mergenoselection', lang)}</span>
          )}
          <div>
            <button
              type="button"
              className={merge.locationUids.length ? 'btn btn-link padding-left-z padding-right-xs' : 'btn btn-link disabled padding-left-z padding-right-xs'}
              onClick={seeSelection}
            >
              {getLabel('seeselection', lang)}
            </button>
          </div>
          <button
            type="button"
            className={merge.locationUids.length && merge.targetUid ? 'btn btn-primary margin-top-xs' : 'btn btn-primary disabled margin-top-xs'}
            onClick={launchMerge}
          >
            {getLabel('launchmerge', lang)}
          </button>
        </div>
      </div>
    );
  }
}

export default MergeMenu;
