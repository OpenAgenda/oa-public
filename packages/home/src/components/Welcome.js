import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import I18nContext from '../contexts/I18nContext';

export default function Welcome() {
  const res = useSelector(state => state.res);
  const { getLabel } = useContext(I18nContext);

  return (
    <div className="content">
      <div className="row">
        <div className="text-center new-user padding-v-md">
          <h2 className="margin-v-md">{getLabel('welcome')}</h2>
          <a href={res.agendas.create} className="btn btn-primary margin-v-sm">{getLabel('createAgenda')}</a>
          <p className="margin-v-sm">{getLabel('orContributeToExisting')}</p>
          <form action={res.search} method="GET" className="margin-top-sm">
            <div className="form-group input-icon-right search center-block">
              <div className="input-icon-right">
                <input type="text" name="search" className="form-control" />
                <button type="submit" className="btn">
                  <i className="fa fa-search" aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
