import AbilitiesEditor from '../src/client/AbilitiesEditor.js';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () =>
  (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

export default {
  title: 'AbilitiesEditor',
};

export function ForUser() {
  return (
    <AbilitiesEditor
      locale="fr"
      entityName="user"
      identifier={99999999}
      res={{
        // get + patch
        formIndex: `http://${getHostname()}:${
          process.env.STORYBOOK_API_PORT
        }/abilities/form-index`,
      }}
    />
  );
}

export function HeaderComponent() {
  return (
    <AbilitiesEditor
      locale="fr"
      entityName="user"
      identifier={99999999}
      res={{
        // get + patch
        formIndex: `http://${getHostname()}:${
          process.env.STORYBOOK_API_PORT
        }/abilities/form-index`,
      }}
      HeaderComponent={() => <div>Un header bidon</div>}
    />
  );
}

export function FilterInput() {
  return (
    <AbilitiesEditor
      locale="fr"
      entityName="user"
      identifier={99999999}
      res={{
        // get + patch
        formIndex: `http://${getHostname()}:${
          process.env.STORYBOOK_API_PORT
        }/abilities/form-index`,
      }}
      searchChildKey="entity.agendaTitle"
      HeaderComponent={() => (
        <div>
          Bon là on ne voit pas le champ de recherche parce qu&apos;il faut au
          minimum 8 agendas...
        </div>
      )}
    />
  );
}
