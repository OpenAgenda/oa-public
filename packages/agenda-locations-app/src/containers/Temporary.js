import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';

function Temporary({ agenda, route }) {
  console.log(route);
  const history = useHistory();
  const message = useSelector(state => state.settings.message ?? 'Bif bof');
  const prefix = useSelector(state => state.settings.prefix);
  const params = useParams();
  console.log(params, history.location, prefix);
  return (
    <>
      <div>{message} {agenda.title}</div>
      <button type="button" onClick={() => history.replace(prefix)}>Push</button>
    </>
  );
}

export default Temporary;
