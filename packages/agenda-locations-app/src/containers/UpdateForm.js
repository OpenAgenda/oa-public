import React from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import { defineMessages, FormattedMessage } from 'react-intl';

import { Spinner } from '@openagenda/react-shared';
import LocationForm from '../components/form-components/LocationForm';
import useRes from '../hooks/useRes';

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
  agenda,
  lang,
  enableGeocode,
  settings,
  tiles,
  detailedInfo
}) => {
  const history = useHistory();
  const res = useRes(agenda);
  const { locationUid } = useParams();
  const historyLocation = useLocation();
  const nq = historyLocation.state;
  const prefix = completedPrefix(agenda, useSelector(state => state.settings.prefix));
  const { isLoading, error, data: location } = useQuery(`location-${locationUid}`, () => (
    axios.get(res.get.replace(':agendaUid', agenda.uid).replace(':locationUid', locationUid), {}).then(response => response.data)
  ));

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
    <LocationForm
      Header={UpdateFormHeader()}
      showToggler={false}
      res={res}
      lang={lang}
      locationProp={location}
      detailedInfo={detailedInfo}
      settings={settings}
      onCancel={() => { if (nq) history.push(nq); else history.push(prefix); }}
      onSuccess={false}
      enableGeocode={enableGeocode}
      postRes={res.create}
      tiles={tiles}
      mode="update"
    />
  );
};

export default UpdateForm;
