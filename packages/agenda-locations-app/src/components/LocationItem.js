
import { defineMessages, FormattedMessage } from 'react-intl';
import makeLabelGetter from '@openagenda/labels';
import countries from '@openagenda/labels/agenda-locations/countries';

const getLabels = makeLabelGetter(countries);

const messages = defineMessages({
  edit: {
    id: 'AgendaLocations.LocationItem.edit',
    defaultMessage: 'Edit',
  },
  remove: {
    id: 'AgendaLocations.LocationItem.remove',
    defaultMessage: 'Delete',
  },
  select: {
    id: 'AgendaLocations.LocationItem.select',
    defaultMessage: 'Select',
  },
  refLocationMerge: {
    id: 'AgendaLocations.LocationItem.refLocationMerge',
    defaultMessage: 'Reference location for merge',
  },
  unselect: {
    id: 'AgendaLocations.LocationItem.unselect',
    defaultMessage: 'Unselect',
  },
  verify: {
    id: 'AgendaLocations.LocationItem.verify',
    defaultMessage: 'To verify',
  },
  noEvent: {
    id: 'AgendaLocations.LocationItem.noEvent',
    defaultMessage: 'No associated event',
  },
  detailsButton: {
    id: 'AgendaLocations.LocationItem.detailsButton',
    defaultMessage: 'Details',
  },
  seeEvents: {
    id: 'AgendaLocations.LocationItem.seeEvents',
    defaultMessage: '{count, plural, =0 {nothing} one {1 associated event} other {# associated events}}',
  },
  verifyDuplicates: {
    id: 'AgendaLocations.LocationItem.verifyDuplicates',
    defaultMessage: '{count, plural, =0 {nothing} one {1 duplicate to verify} other {# duplicates to verify}}',
  },
  verifyAndMerge: {
    id: 'AgendaLocations.LocationItem.verifyAndMerge',
    defaultMessage: 'Verify and Merge',
  },
});

const LocationItem = ({
  merge,
  location,
  settings,
  lang,
  onSelect,
  onEdit,
  onRemove,
  seeEventsRes,
  goToMergeStep3,
  goToMergeStep1FromDuplicates,
  seeDetails
}) => {
  const myRemove = e => {
    e.stopPropagation();
    onRemove(location);
  };

  const myEdit = e => {
    e.stopPropagation();
    onEdit(location);
  };

  const isInMergeSelection = () => {
    if (!merge?.locationUids) return false;
    return merge.locationUids.indexOf(location.uid) !== -1;
  };

  const isMergeEntry = () => {
    if (!merge) return false;
    return (
      merge?.entryPoint === location.uid
    );
  };

  const isMergeTarget = () => {
    if (!merge) return false;
    return (
      merge?.target?.uid === location.uid
    );
  };

  const selectMergeTarget = e => {
    e.stopPropagation();
    goToMergeStep3();
  };

  const goToMergeStep1FromDP = e => {
    e.stopPropagation();
    goToMergeStep1FromDuplicates();
  };

  const seeEvents = e => {
    e.stopPropagation();
    window.location.href = seeEventsRes.replace(
      /:locationUid/g,
      location.uid
    );
  };

  const mySeeDetails = e => {
    e.stopPropagation();
    seeDetails();
  };

  const renderMergeCheckbox = () => (
    <div className="checkbox margin-v-md">
      <label htmlFor="merge-checkbox">
        <input
          /* ref={r => (checkbox = r)} */
          type="checkbox"
          checked={isInMergeSelection()}
        />
      </label>
    </div>
  );

  const className = ['row item'];
  const country = getLabels(location.countryCode, lang) || location.coutryCode;
  const editButton = (
    <button
      type="button"
      className={!settings.access.update.authorized ? 'btn btn-link disabled action' : 'btn btn-link action'}
      onClick={myEdit.bind(this)}
    >
      <FormattedMessage {...messages.edit} />
    </button>
  );
  const removeButton = (
    <button
      type="button"
      className={!settings.access.delete.authorized ? 'btn btn-link text-danger disabled action' : 'btn btn-link text-danger action'}
      onClick={myRemove}
    >
      <FormattedMessage {...messages.remove} />
    </button>
  );
  const selectMergeTargetButton = (
    <button
      type="button"
      className="btn btn-primary"
      onClick={selectMergeTarget}
    >
      <FormattedMessage {...messages.select} />
    </button>
  );

  if (merge && isMergeEntry()) className.push('merge-entry');
  className.push('padding-v-sm');
  return (
    <div
      className={className.join(' ')}
      key={location.uid}
      onClick={() => onSelect(location)}
    >
      <div className="col col-xs-10 col-md-auto item-body">
        <div className="title">{location.name}</div>
        <div>{location.address}</div>
        <div className="text-muted">
          {location.department ? location.department : null}
          {location.region ? (location.department ? ', ' : '') + location.region : null}
          {country ? (location.department || location.region ? ', ' : '') + country : null}
        </div>
        <div className="btn-link-group">
          <i
            className={'indicator'.concat(' ', location.image ? 'fa fa-picture-o margin-right-xs' : 'fa fa-picture-o disabled margin-right-xs')}
          />
          <i
            className={'indicator'.concat(' ',
              !(location.description === null || Object.keys(location.description).length === 0)
                ? 'fa fa-file-text-o margin-right-xs'
                : 'fa fa-file-text-o disabled margin-right-xs')}
          />
          {location.state === 0 ? (
            <span className="badge badge-warning">
              <FormattedMessage {...messages.verify} />
            </span>
          ) : null}
          {location.agendaEventCount ? (
            <button
              type="button"
              className="action btn btn-link"
              onClick={seeEvents}
            >
              <FormattedMessage values={{ count: location.agendaEventCount }} {...messages.seeEvents} />
            </button>
          ) : (
            <span className="action text-muted">
              <FormattedMessage {...messages.noEvent} />
            </span>
          )}
          <button
            type="button"
            className="btn btn-link  action"
            onClick={mySeeDetails.bind(this)}
          >
            <FormattedMessage {...messages.detailsButton} />
          </button>
          {!merge ? editButton : null}
          {!merge ? removeButton : null}
        </div>
        {location.duplicateCandidates && location.duplicateCandidates.length > 0 ? (
          <div>
            <span className="badge badge-warning">
              <FormattedMessage values={{ count: location.duplicateCandidates.length }} {...messages.verifyDuplicates} />
            </span>
            {!merge ? (
              <button
                type="button"
                className={settings.access.merge.authorized ? 'btn btn-link  action' : 'btn btn-link  action disabled'}
                onClick={goToMergeStep1FromDP}
              >
                <FormattedMessage {...messages.verifyAndMerge} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {merge?.step === 1 ? <div className="col col-xs-2 col-md-1 text-center"> {renderMergeCheckbox()} </div> : null}
      {merge?.step === 2 && !isMergeTarget() ? <div className="col col-xs-2 col-md-2 padding-v-md text-center"> {selectMergeTargetButton} </div> : null}
    </div>
  );
};

export default LocationItem;
