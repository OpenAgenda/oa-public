import React, { useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import { defineMessages, FormattedMessage } from 'react-intl';
import FormData from 'form-data';

import { Spinner, useLayoutData } from '@openagenda/react-shared';
import AccessModal from '../components/AccessModal';
import ErrorModal from '../components/ErrorModal';
import LocationForm from '../components/form-components/LocationForm';
import useRes from '../hooks/useRes';
import useSettings from '../hooks/useSettings';
import validate from '../validate';
import * as onGoinActions from '../reducers/onGoinModal';

const completedPrefix = (agenda, prefix) => prefix.replace(':agendaSlug', agenda.slug);

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
});

const UpdateForm = ({
  detailedInfo = true
}) => {
  const { lang, agenda } = useLayoutData();
  const tiles = useSelector(state => state.settings.mapTiles);
  const [errors, setErrors] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const history = useHistory();
  const res = useRes(agenda);
  const { settings } = useSettings(agenda);
  const { locationUid } = useParams();
  const historyLocation = useLocation();
  const nq = historyLocation.state;
  const prefix = completedPrefix(agenda, useSelector(state => state.settings.prefix));
  const { isLoading, error, data: location } = useQuery(['location', locationUid], () => (
    axios.get(res.get.replace(':locationUid', locationUid), {}).then(response => {
      return response.data.location;
    })
  ), { cacheTime: 0 });

  const dispatch = useDispatch();

  const UpdateFormHeader = () => (
    <div className="form-head">
      {nq ? (
        <button type="button" className="btn btn-default" onClick={() => history.push(nq)}>
          <i className="fa fa-angle-left margin-right-sm" />
          <span><FormattedMessage {...messages.back} /></span>
        </button>
      ) : null}
      <h2><FormattedMessage {...messages.title} /></h2>
      <span className="info"><FormattedMessage {...messages.info} /></span>
    </div>
  );

  const onSubmit = updatedLocation => {
    let clean;
    const options = {
      optional: true,
      isEnabled: settings?.displayImageRightsConfirmCheckbox
    };
    try {
      clean = validate(updatedLocation, settings, options);
    } catch (err) {
      setErrors(err);
      return;
    }

    const form = new FormData();
    if (clean.image instanceof File) form.append('image', clean.image);
    form.append('data', JSON.stringify(clean));

    axios.post(res.update.replace(':locationUid', locationUid), form)
      .then(result => {
        if (nq) history.push(nq); else history.push(prefix);
        dispatch(onGoinActions.initiate('update'));
        setErrors(false);
      }).catch(err => {
        setErrorModal(err);
      });
  };

  if (settings && (!settings?.access.update.authorized || settings?.access.update.external)) {
    return (
      <AccessModal
        action="edit"
        close={() => history.push(prefix)}
      />
    );
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
      {errorModal ? (
        <ErrorModal
          close={() => setErrorModal(false)}
          error={errorModal}
        />
      ) : null}
      <LocationForm
        Header={UpdateFormHeader()}
        showToggler
        res={res}
        lang={lang}
        locationProp={location}
        detailedInfo={detailedInfo}
        settings={settings}
        onCancel={() => { if (nq) history.push(nq); else history.push(prefix); }}
        tiles={tiles}
        mode="update"
        onSubmit={onSubmit}
        errors={errors}
      />
    </>
  );
};

export default UpdateForm;
