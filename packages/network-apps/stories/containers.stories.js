import '@openagenda/bs-templates/compiled/main.css';
import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { NetworkAgendas } from '../client/src/containers/NetworkAgendas.js';
import { NetworkEdit } from '../client/src/containers/NetworkEdit.js';

const history = createMemoryHistory();

export default { title: 'Containers' };

export const listOfAgendas = () => {
  return <Router history={history}>
    <NetworkAgendas
      config={{
        base: '/'
      }}
      match={{
        path: '/'
      }}
      path="networks/123/agendas"
      network={{
        uid: 123,
        title: 'Un réseau',
        agendas: [{
          uid: 1,
          title: 'Cobalt Poitiers',
        }, {
          uid: 2,
          title: 'Agendas de la sorties dans la métropole orléanaise'
        }, {
          uid: 3,
          title: 'Nevers Agglo dans ma poche'
        }]
      }}
      onRemove={() => {}}
      onMount={() => {}}
    />
  </Router>
}

export const networkEdit = () => {
  return <Router history={history}>
    <NetworkEdit
      config={{
        lang: 'fr',
        base: '/',
        eventSchema: {
          fields: [{
            field: 'title',
            fieldType: 'text',
            label: 'Titre'
          }]
        }
      }}
      match={{
        path: '/'
      }}
      network={{
        network: {
          uid: 123,
          title: 'Titre de réseau'
        }
      }}
      onMount={() => {}}
    />
  </Router>
}
