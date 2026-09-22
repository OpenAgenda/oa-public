import Main from '../client/src/Main.js';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'main',
};

export const Simple = () => (
  <Main
    locale="fr"
    agendaUid="59272362"
    res="/docx"
    // labels={}
  />
);
