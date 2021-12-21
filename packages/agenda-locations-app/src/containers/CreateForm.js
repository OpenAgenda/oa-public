import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { defineMessages, FormattedMessage } from 'react-intl';

import useRes from '../hooks/useRes';

import LocationForm from '../components/form-components/LocationForm';

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
  agenda,
  lang,
  enableGeocode,
  settings,
  tiles,
  detailedInfo
}) => {
  const history = useHistory();
  const res = useRes(agenda);
  const historyLocation = useLocation();
  const nq = historyLocation.state;
  const prefix = completedPrefix(agenda, useSelector(state => state.settings.prefix));
  console.log('createForm', history, historyLocation, nq);

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

  return (
    <LocationForm
      Header={CreateFormHeader()}
      showToggler={false}
      res={res}
      lang={lang}
      location={null}
      detailedInfo={detailedInfo}
      settings={settings}
      onCancel={() => { if (nq) history.push(nq); else history.push(prefix); }}
      onSuccess={false}
      enableGeocode={enableGeocode}
      postRes={res.create}
      tiles={tiles}
      mode="create"
      agenda={agenda}
    />
  );
};

export default CreateForm;
