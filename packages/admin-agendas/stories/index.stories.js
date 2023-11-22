import createApp from '../components/src/main';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'App',
};

export function All() {
  return createApp({
    skipRender: true,
    searchRes: 'http://localhost:3000/',
    agendaRes: 'http://localhost:3000/get',
    setAgendaRes: 'http://localhost:3000/set',
    membersRes: 'http://localhost:3000/members',
  });
}
