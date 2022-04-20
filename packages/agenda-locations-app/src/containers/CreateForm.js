import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLayoutData } from '@openagenda/react-shared';
import axios from 'axios';
import FormData from 'form-data';

import useRes from '../hooks/useRes';

import AccessModal from '../components/AccessModal';
import LocationForm from '../components/form-components/LocationForm';
import ErrorModal from '../components/ErrorModal';
import useSettings from '../hooks/useSettings';
import validate from '../validate';
import * as onGoinActions from '../reducers/onGoinModal';

const messages = defineMessages({
  back: {
    id: 'AgendaLocations.CreateForm.back',
    defaultMessage: 'Go back to the list',
  },
  title: {
    id: 'AgendaLocations.CreateForm.title',
    defaultMessage: 'Create a location',
  },
  info: {
    id: 'AgendaLocations.CreateForm.info',
    defaultMessage: 'Define the name, address and exact location of the place',
  },
});

const completedPrefix = (agenda, prefix) => prefix.replace(':agendaSlug', agenda.slug);

const CreateForm = ({
  detailedInfo = true
}) => {
  const { lang, agenda } = useLayoutData();
  const tiles = useSelector(state => state.settings.mapTiles);
  const [errors, setErrors] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const history = useHistory();
  const res = useRes(agenda);
  const { settings } = useSettings(agenda);
  const historyLocation = useLocation();
  const nq = historyLocation.state;
  const prefix = completedPrefix(agenda, useSelector(state => state.settings.prefix));
  const dispatch = useDispatch();

  const CreateFormHeader = () => (
    <div className="head padding-bottom-md">
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

  const onSubmit = location => {
    let clean;
    const options = {
      optional: false,
      isEnabled: settings?.displayImageRightsConfirmCheckbox
    };
    try {
      clean = validate(location, settings, options);
    } catch (err) {
      setErrors(err);
      return;
    }
    const form = new FormData();
    if (clean.image instanceof File) form.append('image', clean.image);
    form.append('data', JSON.stringify(clean));
    axios.post(res.create, form)
      .then(result => {
        dispatch(onGoinActions.initiate('create'));
        if (nq) history.push(nq); else history.push(prefix);
        setErrors(false);
      }).catch(err => {
        setErrorModal(err);
      });
  };

  if (settings && (!settings?.access.create.authorized || settings?.access.create.external)) {
    return (
      <AccessModal
        action="create"
        close={() => history.push(prefix)}
      />
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
        Header={CreateFormHeader()}
        showToggler={false}
        res={res}
        lang={lang}
        location={null}
        detailedInfo={detailedInfo}
        settings={settings}
        onCancel={() => { if (nq) history.push(nq); else history.push(prefix); }}
        onSubmit={onSubmit}
        tiles={tiles}
        mode="create"
        errors={errors}
        displayExtIdLink
      />
    </>
  );
};

export default CreateForm;
