import _ from 'lodash';
import Breadcrumbs from './Breadcrumbs';
import React, { Component } from 'react';

export default props => {

  const { children } = props;

  return <div className="container margin-top-lg">
    <h1 className="text-center margin-bottom-md">Gestion des réseaux d'agendas</h1>
    <div className="col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">
      <Breadcrumbs {...props} />
      {children}
    </div>
  </div>

}
