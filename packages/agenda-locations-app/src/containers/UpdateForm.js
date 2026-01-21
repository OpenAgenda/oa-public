import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { Spinner, useLayoutData } from '@openagenda/react-shared';
import AccessModal from '../components/AccessModal.js';
import ErrorModal from '../components/ErrorModal.js';
import DeletedLocationModal from '../components/DeletedLocationModal.js';
import LocationForm from '../components/form-components/LocationForm.js';
import useRes from '../hooks/useRes.js';
import useSettings from '../hooks/useSettings.js';
import validate from '../validate.js';
import * as onGoingActions from '../reducers/onGoingModal.js';

const completedPrefix = (agenda, prefix) =>
  prefix.replace(':agendaSlug', agenda.slug);

const messages = defineMessages({
  back: {
    id: 'AgendaLocations.UpdateForm.back',
    defaultMessage: 'Go back to the list',
  },
  title: {
    id: 'AgendaLocations.UpdateForm.title',
    defaultMessage: 'Location edit',
  },
  info: {
    id: 'AgendaLocations.UpdateForm.info',
    defaultMessage: 'All events attached to this location will be updated',
  },
  invalidSIRET: {
    id: 'AgendaLocations.LocationSelector.invalidSIRET',
    defaultMessage: 'SIRET must be a 14 characters-long number',
  },
});

const UpdateFormHeader = ({ nq, history }) => (
  <div className="form-head">
    {nq ? (
      <button
        type="button"
        className="btn btn-default"
        onClick={() => history.push(nq)}
      >
        <i className="fa fa-angle-left margin-right-sm" />
        <span>
          <FormattedMessage {...messages.back} />
        </span>
      </button>
    ) : null}
    <h2>
      <FormattedMessage {...messages.title} />
    </h2>
    <span className="info">
      <FormattedMessage {...messages.info} />
    </span>
  </div>
);

const UpdateForm = ({ detailedInfo = true }) => {
  const { lang, agenda } = useLayoutData();
  const tiles = useSelector((state) => state.settings.mapTiles);
  const [errors, setErrors] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [pageSpin, setPageSpin] = useState(false);
  const [unfoundLocation, setUnfoundLocation] = useState(false);
  const [deletedLocation, setDeletedLocation] = useState(null);
  const history = useHistory();
  const res = useRes(agenda);
  const { settings } = useSettings(agenda);
  const { locationUid } = useParams();
  const historyLocation = useLocation();
  const prefix = completedPrefix(
    agenda,
    useSelector((state) => state.settings.prefix),
  );
  const nq = historyLocation.state
    || (historyLocation.search ? `${prefix}${historyLocation.search}` : null);
  const { isLoading, data: location } = useQuery(
    ['location', locationUid],
    () => {
      const url = `${res.get.replace(':locationUid', locationUid)}${res.get.includes('?') ? '&' : '?'}deleted=null`;
      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Invalid status (${response.status})`);
          }
          return response.json();
        })
        .then((data) => {
          const loc = data.location;
          // Check if location is deleted
          if (loc && loc.deleted === 1) {
            setDeletedLocation(loc);
            return null;
          }
          return loc;
        })
        .catch((_err) => {
          setUnfoundLocation(true);
        });
    },
    { cacheTime: 0 },
  );
  const intl = useIntl();

  const dispatch = useDispatch();

  const onSubmit = (updatedLocation) => {
    setPageSpin(true);
    let clean;
    try {
      clean = validate(updatedLocation, settings, {
        optional: true,
        isEnabled: settings?.displayImageRightsConfirmCheckbox,
        displaySIRETInput: settings?.displaySIRETInput,
        invalidSIRET: intl.formatMessage(messages.invalidSIRET),
      });
    } catch (err) {
      setPageSpin(false);
      setErrors(err);
      return;
    }

    const form = new FormData();
    if (clean.image instanceof File) form.append('image', clean.image);
    form.append('data', JSON.stringify(clean));
    return fetch(res.update.replace(':locationUid', locationUid), {
      method: 'POST',
      body: form,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.json();
      })
      .then(() => {
        setPageSpin(false);
        if (nq) history.push(nq);
        else history.push(prefix);
        dispatch(onGoingActions.initiate('update'));
        setErrors(false);
      })
      .catch((err) => {
        setPageSpin(false);
        setErrorModal(err);
      });
  };

  if (
    settings
    && (!settings?.access.update.authorized || settings?.access.update.external)
  ) {
    return <AccessModal action="edit" close={() => history.push(prefix)} />;
  }

  if (isLoading) {
    return (
      <i style={{ padding: '0.2em 0.65em' }}>
        <Spinner
          mode="inline"
          options={{
            width: 2,
            length: 3,
            radius: 4,
            color: '#666',
          }}
        />
      </i>
    );
  }

  return (
    <>
      {deletedLocation ? (
        <DeletedLocationModal
          close={() => history.push(nq || prefix)}
          mergedIn={deletedLocation.mergedIn}
          prefix={prefix}
        />
      ) : null}
      {errorModal || unfoundLocation ? (
        <ErrorModal close={() => setErrorModal(false)} error={errorModal} />
      ) : null}
      {!unfoundLocation && !deletedLocation ? (
        <LocationForm
          Header={UpdateFormHeader({ nq, history })}
          showToggler
          res={res}
          lang={lang}
          locationProp={location}
          detailedInfo={detailedInfo}
          settings={settings}
          onCancel={() => {
            if (nq) history.push(nq);
            else history.push(prefix);
          }}
          tiles={tiles}
          mode="update"
          onSubmit={onSubmit}
          errors={errors}
          displayExtIdLink
          pageSpin={pageSpin}
        />
      ) : null}
    </>
  );
};

export default UpdateForm;
